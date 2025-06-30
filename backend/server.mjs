import Fastify from 'fastify';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from '@fastify/cors';
import awsLambdaFastify from '@fastify/aws-lambda';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'blugigi';

const fastify = Fastify({
  logger: true
});

const allowedOrigins = [
  'https://444.netlify.app',
];

await fastify.register(cors, {
  origin: process.env.NODE_ENV !== 'production' ? true : (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
    });
    fastify.log.info('MongoDB connected');
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, maxlength: 50 },
  password_hash: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const blockSchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: String, default: '' },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  children: { type: [mongoose.Schema.Types.Mixed], default: [] }
});

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 255 },
  path: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return v.startsWith('/');
      },
      message: props => `${props.value} is not a valid path! Path must start with /.`
    }
  },
  blocks: [blockSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.index({ userId: 1, path: 1 }, { unique: true });

noteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

noteSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Note = mongoose.model('Note', noteSchema);

fastify.decorate("authenticate", async function (request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided or malformed token');
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = await User.findById(decoded.id).select('-password_hash');
    if (!request.user) {
      throw new Error('User not found for token');
    }
  } catch (err) {
    fastify.log.warn({ msg: 'Authentication failed', error: err.message, stack: err.stack });
    reply.status(401).send({ error: 'Authentication failed: ' + err.message });
  }
});

fastify.get('/', async function handler(request, reply) {
  return { hello: 'world' };
});

fastify.get('/users/count', async (request, reply) => {
  const count = await User.countDocuments();
  return { count };
});

fastify.post('/api/register', async (request, reply) => {
  const { username, password } = request.body;
  if (!username || !password) {
    return reply.status(400).send({ error: 'Missing username or password' });
  }
  if (password.length < 6) {
    return reply.status(400).send({ error: 'Password must be at least 6 characters long' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password_hash });
    await user.save();
    reply.status(201).send({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return reply.status(409).send({ error: 'Username already exists' });
    }
    fastify.log.error(err);
    reply.status(500).send({ error: 'Database error during registration' });
  }
});

fastify.post('/api/login', async (request, reply) => {
  const { username, password } = request.body;
  if (!username || !password) {
    return reply.status(400).send({ error: 'Missing username or password' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return reply.status(401).send({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    reply.send({ token, username: user.username, userId: user._id });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: 'Database error during login' });
  }
});

// --- Notes API ---

fastify.post('/api/notes', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const { title, path, blocks } = request.body;
    const userId = request.user._id;

    if (!title || !path || !blocks) {
      return reply.status(400).send({ error: 'Missing required fields: title, path, or blocks' });
    }
    if (!path.startsWith('/')) {
      return reply.status(400).send({ error: 'Path must start with /' });
    }

    const newNote = new Note({
      userId,
      title,
      path,
      blocks
    });
    await newNote.save();
    reply.status(201).send(newNote);
  } catch (err) {
    fastify.log.error({ msg: "Error creating note", err });
    if (err.code === 11000) { // Duplicate key error for userId + path
      return reply.status(409).send({ error: `A note with path '${request.body.path}' already exists for this user.` });
    }
    if (err.name === 'ValidationError') {
      return reply.status(400).send({ error: 'Validation Error: ' + err.message });
    }
    reply.status(500).send({ error: 'Failed to create note: ' + err.message });
  }
});

fastify.get('/api/notes', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const userId = request.user._id;
    const notes = await Note.find({ userId }).sort({ updatedAt: -1 }).select('title path');
    reply.send(notes);
  } catch (err) {
    fastify.log.error({ msg: "Error fetching notes", err });
    reply.status(500).send({ error: 'Failed to retrieve notes: ' + err.message });
  }
});

fastify.get('/api/notes/*', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const userId = request.user._id;
    const notePath = '/' + (request.params['*'] || ''); // Ensure path starts with /

    const note = await Note.findOne({ userId, path: notePath });

    if (!note) {
      return reply.status(404).send({ error: `Note with path '${notePath}' not found or access denied` });
    }
    reply.send(note);
  } catch (err) {
    fastify.log.error({ msg: "Error fetching note by path", err });
    reply.status(500).send({ error: 'Failed to retrieve note: ' + err.message });
  }
});

fastify.put('/api/notes/*', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const userId = request.user._id;
    const notePath = '/' + (request.params['*'] || '');
    const { title, blocks, path: newPath } = request.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (newPath !== undefined) {
      if (!newPath.startsWith('/')) {
        return reply.status(400).send({ error: 'New path must start with /' });
      }
      updateData.path = newPath;
    }

    if (Object.keys(updateData).length === 0) {
      return reply.status(400).send({ error: 'No update fields provided.' });
    }

    const note = await Note.findOneAndUpdate(
      { userId, path: notePath },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!note) {
      return reply.status(404).send({ error: `Note with path '${notePath}' not found or access denied` });
    }
    reply.send(note);
  } catch (err) {
    fastify.log.error({ msg: "Error updating note by path", err });
    if (err.code === 11000) {
      return reply.status(409).send({ error: `A note with path '${request.body.newPath}' already exists for this user.` });
    }
    if (err.name === 'ValidationError') {
      return reply.status(400).send({ error: 'Validation Error: ' + err.message });
    }
    reply.status(500).send({ error: 'Failed to update note: ' + err.message });
  }
});

fastify.delete('/api/notes/*', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const userId = request.user._id;
    const notePath = '/' + (request.params['*'] || '');

    const result = await Note.deleteOne({ userId, path: notePath });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ error: `Note with path '${notePath}' not found or access denied` });
    }
    reply.status(200).send({ message: `Note with path '${notePath}' deleted successfully` });
  } catch (err) {
    fastify.log.error({ msg: "Error deleting note by path", err });
    reply.status(500).send({ error: 'Failed to delete note: ' + err.message });
  }
});

// Search

fastify.get('/api/notes/search', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  try {
    const userId = request.user._id;
    const { q: searchQuery } = request.query; // q is a common query param name for search

    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim() === '') {
      return reply.status(400).send({ error: 'Search query "q" is required and cannot be empty.' });
    }

    const escapedSearchQuery = searchQuery.trim().replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

    const notes = await Note.find({
      userId,
      blocks: {
        $elemMatch: {
          $or: [
            { type: 'paragraph', content: { $regex: new RegExp(escapedSearchQuery, 'i') } },
            { type: 'heading_one', content: { $regex: new RegExp(escapedSearchQuery, 'i') } }
          ]
        }
      }
    })
      .sort({ updatedAt: -1 })
      .limit(5) // Limit to 5 notes
      .select('title path _id createdAt updatedAt')
      .lean();

    reply.send(notes);

  } catch (err) {
    fastify.log.error({ msg: "Error searching notes", query: request.query.q, userId: request.user?._id, err });
    reply.status(500).send({ error: 'Failed to search notes: ' + err.message });
  }
});

const proxy = awsLambdaFastify(fastify);

export const handler = async (event, context) => {
  await connectDB();
  return proxy(event, context);
};

// Add this block for local development:
if (process.env.NETLIFY_DEV === 'true' || process.env.NODE_ENV !== 'production') {
  // Only start server if not running as Lambda
  const PORT = process.env.PORT || 8888;
  connectDB().then(() => {
    fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      fastify.log.info(`Server listening on http://localhost:${PORT}`);
    });
  });
}