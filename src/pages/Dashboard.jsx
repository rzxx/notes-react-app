import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import GradientBackground from "../components/GradientBackground";
import ItemsList from "../components/ItemsList";
import SearchField from "../components/SearchField";
import BlockMenu from "../components/BlockMenu";

const API_BASE_URL = 'http://127.0.0.1:3000';

const Dashboard = () => {
	const params = useParams();
	const notePath = params['*'] || '';
	const navigate = useNavigate();
	const [username] = useState(() => localStorage.getItem('username') || 'Пользователь');

	const [currentNote, setCurrentNote] = useState(null);
	const [allNotes, setAllNotes] = useState([]);
	const [pathNotes, setPathNotes] = useState([]);
	const [parentNotes, setParentNotes] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const [newParagraph, setNewParagraph] = useState("");

	const [isDrawerOpen, setisDrawerOpen] = useState(false);
	const [isMobileMenuOpen, setisMobileMenuOpen] = useState(false);

	const [activeMenuIndex, setActiveMenuIndex] = useState(null);
	const menuHideTimerRef = useRef(null); // To manage the timeout for hiding menu

	const [parentDirForCreateContext, setParentDirForCreateContext] = useState('');

	const getToken = () => localStorage.getItem('token');

	const fetchAllNotes = useCallback(async () => {
		const token = getToken();
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/notes`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (!response.ok) {
				const errData = await response.json();
				if (response.status === 401) {
					localStorage.removeItem('token');
					navigate("/login");
				}
				throw new Error(errData.error || `Failed to fetch all notes: ${response.status}`);
			}
			const data = await response.json();
			setAllNotes(data);
		} catch (err) {
			console.error("Fetch all notes error:", err);
		}
	}, [navigate]);

	const fetchNoteByPath = useCallback(async (path) => {
		setisDrawerOpen(false);
		setError(null);
		if (path === '' && !currentNote?.path?.startsWith('/')) { // Special handling for navigating to "root view"
			setCurrentNote(null); // No specific note for root, unless you have one at path "/"
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		const token = getToken();
		if (!token) {
			navigate("/login"); // Redirect to login if no token
			return;
		}

		try {
			// Ensure path for API always starts with a single slash
			const apiPath = path.startsWith('/') ? path : `/${path}`;
			const response = await fetch(`${API_BASE_URL}/api/notes${apiPath}`, { // Corrected path construction
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (!response.ok) {
				if (response.status === 404) {
					setCurrentNote(null); // Note not found
					setError(`Note with path '${apiPath}' not found.`);
				} else if (response.status === 401) {
					localStorage.removeItem('token');
					navigate("/login");
				}
				else {
					const errData = await response.json();
					throw new Error(errData.error || `Failed to fetch note: ${response.status}`);
				}
			} else {
				const data = await response.json();
				setCurrentNote(data);
			}
		} catch (err) {
			console.error("Fetch note error:", err);
			setError(err.message);
			/* if () navigate('/login'); */
			setCurrentNote(null);
		} finally {
			setIsLoading(false);
		}
	}, [navigate, currentNote?.path]);

	useEffect(() => {
		fetchAllNotes(); // Fetch all notes on component mount or when user changes
	}, [fetchAllNotes]); // Add fetchAllNotes to dependency array

	useEffect(() => {
		fetchNoteByPath(notePath);
	}, [notePath, fetchNoteByPath]);

	// Effect to derive parentNotes and pathNotes
	useEffect(() => {
		if (!allNotes || allNotes.length === 0) {
			setParentNotes([]);
			setPathNotes([]);
			setParentDirForCreateContext('');
			return;
		}

		const currentContextNormalizedPath = notePath ? `/${notePath}` : '/';
		const currentPathSegments = notePath.split('/').filter(Boolean); // Segments of current path
		const currentContextDepth = currentPathSegments.length; // Depth of current path

		// 1. Calculate pathNotes (direct children of the current context/notePath)
		const expectedChildDepth = currentContextDepth + 1;
		const childPathPrefix = currentContextNormalizedPath === '/' ? '/' : `${currentContextNormalizedPath}/`;

		const newPathNotes = allNotes.filter(note => {
			const noteSegments = note.path.split('/').filter(Boolean);
			// Ensure note.path starts with a slash if we expect it from allNotes
			// Assuming note.path in allNotes is like "/foo" or "/foo/bar"
			return noteSegments.length === expectedChildDepth && note.path.startsWith(childPathPrefix);
		});
		setPathNotes(newPathNotes);

		// 2. Calculate parentNotes (siblings of the PARENT of the current note/context)
		let newParentNotesResult = [];
		let parentDirContextForCreation = ''; // Path for "Create Note" in parentNotes list

		if (currentContextDepth === 0) {
			// At root ('/'). No "grandparent" directory context. ParentNotes is empty.
			newParentNotesResult = [];
			// 'Create Note' in an empty parent list doesn't make sense for "up one level"
			// but if you had a static "Create in root" button, parentDirContextForCreation would be ''
			parentDirContextForCreation = ''; // Or perhaps null/undefined to hide create button
		} else if (currentContextDepth === 1) {
			// Current is one level deep (e.g., '/foo').
			// parentNotes should be items in the root directory ('/').
			// These items are at depth 1.
			const targetItemDepthInParentList = 1;
			// Their path prefix is '/' (root).
			const targetItemPrefixInParentList = '/';

			newParentNotesResult = allNotes.filter(note => {
				const noteSegments = note.path.split('/').filter(Boolean);
				return noteSegments.length === targetItemDepthInParentList &&
					note.path.startsWith(targetItemPrefixInParentList);
			});
			// 'Create Note' in this parentNotes list (showing root items) should create a new note in the root.
			parentDirContextForCreation = '';
		} else { // currentContextDepth >= 2
			// Current is two or more levels deep (e.g., '/foo/bar' or '/foo/bar/baz').
			// The current note/context is `currentPathSegments[currentContextDepth - 1]`.
			// Its parent directory's segments are `currentPathSegments.slice(0, -1)`.
			// We want to list items from the "grandparent" directory.
			// Segments of the "grandparent" directory:
			const grandparentDirSegments = currentPathSegments.slice(0, -2); // e.g., if current is /foo/bar/note, grandparent is /foo
			// e.g., if current is /foo/note, grandparent is / (empty segments)
			const grandparentDirDepth = grandparentDirSegments.length;

			// Notes to display in parentNotes are children of this "grandparent" directory.
			// Their depth will be grandparentDirDepth + 1.
			const targetItemDepthInParentList = grandparentDirDepth + 1;

			// Their path prefix will be based on grandparentDirSegments.
			const targetItemPrefixInParentList = grandparentDirSegments.length > 0
				? `/${grandparentDirSegments.join('/')}/` // e.g., If grandparent is '/foo', prefix is '/foo/'
				: '/';                                   // e.g., If grandparent is root, prefix is '/'

			newParentNotesResult = allNotes.filter(note => {
				const noteSegments = note.path.split('/').filter(Boolean);
				return noteSegments.length === targetItemDepthInParentList &&
					note.path.startsWith(targetItemPrefixInParentList);
			});

			// 'Create Note' in parentNotes should create a new note inside that "grandparent" directory.
			parentDirContextForCreation = grandparentDirSegments.join('/'); // e.g., 'foo' or '' for root
		}

		setParentNotes(newParentNotesResult);
		setParentDirForCreateContext(parentDirContextForCreation);

	}, [allNotes, notePath]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('username');
		navigate("/");
	};

	const createNewNote = useCallback(async (parentPathSegment = '') => {
		setIsLoading(true);
		setError(null);
		const token = getToken();
		if (!token) {
			navigate("/login");
			return null;
		}
		try {
			const baseTitle = "Новая заметка";
			const baseNameForPath = "new-note"; // "new-note"
			// parentPathSegment is like '', 'foo', 'foo/bar'
			const pathPrefix = parentPathSegment ? `/${parentPathSegment}` : ''; // e.g., "/foo" or ""

			let finalPath;

			// Try base name first (e.g., /foo/new-note or /new-note)
			let potentialPath = `${pathPrefix}/${baseNameForPath}`;
			if (!allNotes.some(n => n.path === potentialPath)) {
				finalPath = potentialPath;
			} else {
				// If base name is taken, try with suffix -2, -3, ...
				let i = 2;
				while (true) {
					potentialPath = `${pathPrefix}/${baseNameForPath}-${i}`;
					if (!allNotes.some(n => n.path === potentialPath)) {
						finalPath = potentialPath;
						break;
					}
					i++;
				}
			}

			const response = await fetch(`${API_BASE_URL}/api/notes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					title: baseTitle,
					path: finalPath, // Use the unique finalPath
					blocks: []
				})
			});
			if (!response.ok) {
				const errData = await response.json();
				if (response.status === 401) {
					localStorage.removeItem('token');
					navigate("/login");
				}
				throw new Error(errData.error || `Failed to create note: ${response.status}`);
			}
			const newNoteData = await response.json();
			await fetchAllNotes(); // Refresh all notes, which will trigger parent/path notes update
			navigate(`/dashboard${newNoteData.path}`);
			return newNoteData;
		} catch (err) {
			console.error("Create note error:", err);
			setError(err.message);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [navigate, allNotes, fetchAllNotes]); // Added allNotes and fetchAllNotes to dependencies

	const updateExistingNote = async (path, updateData) => {
		setError(null);
		const token = getToken();
		if (!token) {
			navigate("/login");
			return null;
		}
		try {
			const apiPath = path.startsWith('/') ? path : `/${path}`;
			const response = await fetch(`${API_BASE_URL}/api/notes${apiPath}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(updateData)
			});
			if (!response.ok) {
				const errData = await response.json();
				if (response.status === 401) {
					localStorage.removeItem('token');
					navigate("/login");
				}
				throw new Error(errData.error || `Failed to update note: ${response.status}`);
			}
			const updatedNote = await response.json();
			// Only update currentNote if it's the one being edited,
			// or if path hasn't changed. This is important for block reordering.
			if (currentNote && currentNote.path === apiPath) {
				if (updateData.blocks === undefined) { // If not just blocks (e.g. title, path)
					setCurrentNote(updatedNote); // Update from server response
				}
			}
			if (updateData.path || updateData.title) {
				await fetchAllNotes(); // Refresh all notes list
			}

			if (updateData.path && updateData.path !== apiPath) {
				navigate(`/dashboard${updateData.path}`);
			}
			return updatedNote;
		} catch (err) {
			console.error("Update note error:", err);
			setError(err.message);
			if (currentNote && currentNote.path === path) {
				fetchNoteByPath(path); // Re-fetch the note to ensure consistency
			}
			return null;
		}
	};

	const deleteCurrentNote = async () => {
		if (!currentNote || !currentNote.path) {
			setError("Нет заметки для удаления.");
			return;
		}

		// Optional: Add a confirmation dialog here
		if (!window.confirm(`Вы уверены, что хотите удалить заметку "${currentNote.title}"?`)) {
			return;
		}

		setIsLoading(true);
		setError(null);
		const token = getToken();
		if (!token) {
			navigate("/");
			return;
		}

		try {
			const apiPath = currentNote.path.startsWith('/') ? currentNote.path : `/${currentNote.path}`;
			const response = await fetch(`${API_BASE_URL}/api/notes${apiPath}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				const errData = await response.json();
				if (response.status === 401) {
					localStorage.removeItem('token');
					navigate("/login");
				}
				throw new Error(errData.error || `Failed to delete note: ${response.status}`);
			}

			// Success
			setisDrawerOpen(false); // Close drawer
			const deletedPath = currentNote.path;
			setCurrentNote(null); // Clear current note
			const parentSegments = deletedPath.split('/').filter(Boolean).slice(0, -1);
			const parentDir = parentSegments.length > 0 ? `/${parentSegments.join('/')}` : '/';

			await fetchAllNotes(); // Fetch fresh list BEFORE deciding where to navigate

			// After fetchAllNotes, allNotes state is updated.
			// We need to use a local copy or wait for the next render cycle if we depend on derived `parentNotes` for navigation.
			// Simpler: navigate to parent directory or root.

			if (parentDir !== '/' && parentDir.length > 0) {
				navigate(`/dashboard${parentDir}`);
			} else {
				navigate('/dashboard');
			}
		} catch (err) {
			console.error("Delete note error:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMoveBlock = async (index, direction) => {
		if (!currentNote || !currentNote.blocks) return;

		const currentBlocks = currentNote.blocks;
		const newBlocks = [...currentBlocks]; // Create a new array

		if (direction === 'up') {
			if (index === 0) return; // Already at the top
			// Swap element at index with element at index - 1
			[newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
		} else if (direction === 'down') {
			if (index === currentBlocks.length - 1) return; // Already at the bottom
			// Swap element at index with element at index + 1
			[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
		} else {
			return; // Invalid direction
		}

		// Optimistic UI update
		setCurrentNote(prev => ({
			...prev,
			blocks: newBlocks
		}));

		// Persist change to the backend
		try {
			await updateExistingNote(currentNote.path, { blocks: newBlocks });
		} catch (error) {
			console.error("Failed to move block:", error);
			// Revert optimistic update by fetching the note again if saving failed
			fetchNoteByPath(currentNote.path);
			// You might want to show an error message to the user here
		}
	};

	const handleAddBlockAfter = async (index, blockType) => {
		if (!currentNote || !currentNote.blocks) return;
		const originalBlocks = currentNote.blocks || [];
		let newBlockData;

		switch (blockType) {
			case 'heading_one':
				newBlockData = { type: 'heading_one', content: "Заголовок" };
				break;
			case 'divider':
				newBlockData = { type: 'divider', content: null }; // No content for divider
				break;
			case 'paragraph':
			default:
				newBlockData = { type: 'paragraph', content: "" };
				break;
		}

		const newBlocksList = [...originalBlocks];
		newBlocksList.splice(index + 1, 0, newBlockData);

		setCurrentNote(prev => ({
			...prev,
			blocks: newBlocksList
		}));

		try {
			await updateExistingNote(currentNote.path, { blocks: newBlocksList });
		} catch (error) {
			console.error("Failed to add block:", error);
			setCurrentNote(prev => ({
				...prev,
				blocks: originalBlocks // Revert
			}));
			setError("Не удалось добавить блок.");
		}
	};

	const handleDeleteBlock = async (indexToDelete) => {
		if (!currentNote || !currentNote.blocks) return;

		const originalBlocks = currentNote.blocks;
		const newBlocks = originalBlocks.filter((_, index) => index !== indexToDelete);

		// Optimistic UI update
		setCurrentNote(prev => ({
			...prev,
			blocks: newBlocks
		}));

		// Adjust activeMenuIndex if the deleted block was active or before the active one
		if (activeMenuIndex === indexToDelete) {
			setActiveMenuIndex(null);
		} else if (activeMenuIndex > indexToDelete) {
			setActiveMenuIndex(prev => (prev ? prev - 1 : null));
		}

		try {
			await updateExistingNote(currentNote.path, { blocks: newBlocks });
		} catch (error) {
			console.error("Failed to delete block:", error);
			setCurrentNote(prev => ({ // Revert
				...prev,
				blocks: originalBlocks
			}));
			setError("Не удалось удалить блок.");
		}
	};

	const handleBlockAreaMouseEnter = (index) => {
		clearTimeout(menuHideTimerRef.current); // Clear any pending hide operations
		setActiveMenuIndex(index);
	};

	const handleBlockAreaMouseLeave = () => {
		// Set a timer to hide the menu. If the mouse re-enters the block area
		// or enters the menu itself before the timer fires, the hide will be cancelled.
		menuHideTimerRef.current = setTimeout(() => {
			setActiveMenuIndex(null);
		}, 200); // Adjust this delay (in ms) as needed for comfortable interaction
	};

	// This function will be called by BlockMenu when the mouse enters it or its items get focus
	const handleMenuInteraction = () => {
		clearTimeout(menuHideTimerRef.current); // Keep the menu open
	};


	return (
		<>
			<GradientBackground />

			{/* desktop navbar */}
			<div className="w-dvw px-14 xl:grid grid-cols-3 hidden py-4">
				<Link to="/" className="text-lg font-black text-stone-700/85 hidden xl:block">Grainy Notes</Link>

				<div className={`flex flex-col justify-center items-center text-center transition-opacity duration-300 ease-out ${isDrawerOpen && 'opacity-0'}`}>
					{isLoading && !currentNote
						? <h4 className="text-xl font-black text-stone-500 opacity-85 animate-pulse">Загрузка...</h4>
						: (currentNote
							? <h4 className="text-xl font-black text-transparent bg-linear-to-tr from-yellow-900/85 to-rose-900/85 bg-clip-text cursor-default">{currentNote.title.trim()
								? currentNote.title : "Нет названия"}</h4>
							: <h4 className="text-xl font-black text-rose-800/70">Заметка не найдена.</h4>)
					}
					<p className="text-sm text-stone-700/85 cursor-default">/{notePath}</p>
				</div>

				<div className="w-56 justify-self-end">
					<SearchField />
				</div>
			</div>
			{/* mobile navbar */}
			<div className="w-dvw xl:hidden min-h-20 max-h-dvh flex flex-col-reverse">
				<div className="shrink-0 w-full flex justify-between items-center md:px-8 px-4 py-4">
					<div className={`flex flex-col justify-center items-start transition-opacity duration-300 ease-out ${isDrawerOpen && !isMobileMenuOpen && 'opacity-0'}`}>
						{isLoading
							? <h4 className="text-xl font-black text-stone-500 opacity-85 animate-pulse">Загрузка...</h4>
							: (currentNote
								? <h4 className="text-xl font-black text-transparent bg-linear-to-tr from-yellow-900/85 to-rose-900/85 bg-clip-text cursor-default">{currentNote.title.trim()
									? currentNote.title : "Нет названия"}</h4>
								: <h4 className="text-xl font-black text-rose-800/70">Заметка не найдена.</h4>)
						}
						<p className="text-sm text-stone-700/85 cursor-default">/{notePath}</p>
					</div>
					<button onClick={() => setisMobileMenuOpen(v => !v)} className="cursor-pointer">
						<span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
							home
						</span>
					</button>
				</div>

				<div className={`flex-1 min-h-0 w-full md:px-8 px-4 flex flex-col items-center justify-start duration-150 transition-all ease-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : '-translate-y-8 opacity-0'}`}>
					{isMobileMenuOpen && <>
						<Link to="/" className="shrink-0 text-lg font-black text-stone-700/85 my-4">Grainy Notes</Link>

						<div className="shrink-0 w-full flex items-start justify-between mb-4">
							<p className="text-stone-500/85 text-sm">{username}</p>
							<div className="flex gap-4">
								<Link to="/profile" className="">
									<span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
										account_circle
									</span>
								</Link>
								<button onClick={handleLogout} className="cursor-pointer">
									<span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
										logout
									</span>
								</button>
							</div>
						</div>
						<div className="w-full mb-4">
							<SearchField />
						</div>
						<div className="flex-1 min-h-0 w-full flex items-center-safe overflow-y-auto no-scrollbar mb-2">
							<ItemsList currentPath={notePath} items={allNotes} createNote={() => createNewNote(notePath)} />
						</div>
					</>}
				</div>
			</div>

			<div className="w-dvw relative"
				style={{ height: "calc(100vh - 5rem)" }}>
				<div className="absolute px-14 h-full left-0 top-0 xl:flex flex-col gap-2 hidden">
					<div className="flex-1 min-w-42 flex items-center-safe overflow-y-auto max-h-full no-scrollbar">
						<ItemsList currentPath={notePath} items={parentNotes} createNote={() => createNewNote(parentDirForCreateContext)} />
					</div>

					<div className="mb-6">
						<p className="text-stone-500/85 text-sm mb-1">{username}</p>
						<Link to="/profile" className="mr-2">
							<span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
								account_circle
							</span>
						</Link>
						<button onClick={handleLogout} className="cursor-pointer">
							<span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
								logout
							</span>
						</button>
					</div>
				</div>
				<div className="absolute px-14 h-full right-0 top-0 xl:flex flex-col gap-2 hidden">
					<div className="flex-1 min-w-42 flex items-center-safe overflow-y-auto max-h-full no-scrollbar">
						<ItemsList currentPath={notePath} items={pathNotes} createNote={() => createNewNote(notePath)} />
					</div>
				</div>
				<div className="2xl:max-w-5xl w-full xl:max-w-4xl xl:mx-auto h-full bg-stone-50/85 rounded-t-4xl shadow-box overflow-clip flex flex-col">
					<div className={`mx-auto md:px-8 px-4 bg-stone-200/85 w-full overflow-hidden duration-300 transition-all ease-out relative ${isDrawerOpen ? 'max-h-full py-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
						{/* settings drawer */}
						{currentNote && <>
							<div>
								<label className="text-stone-500 text-lg font-semibold">Изменить название:
									<input className="ml-2 w-fit text-lg font-semibold text-stone-700"
										value={currentNote.title}
										placeholder="Введите название заметки"
										onChange={(e) =>
											setCurrentNote((prev) => ({
												...prev,
												title: e.target.value
											}))
										}
										onBlur={() => {
											if (!currentNote.title.trim()) return;
											if (currentNote.path) {
												updateExistingNote(currentNote.path, { title: currentNote.title });
											};
										}} />
								</label>
								<p className="text-stone-500 mb-4 cursor-default">{currentNote.path}</p>
								<p className="text-sm text-stone-500 cursor-default">{`Создано: ${currentNote.createdAt ? new Date(currentNote.createdAt).toLocaleString() : "—"}`}</p>
								<p className="text-sm text-stone-500 cursor-default">{`Редактировано: ${currentNote.updatedAt ? new Date(currentNote.updatedAt).toLocaleString() : "—"}`}</p>
							</div>
							<div className="absolute bottom-4 right-8 flex w-full flex-row-reverse">
								<button className="cursor-pointer" onClick={deleteCurrentNote}>
									<span className="material-symbols-outlined text-stone-700/85 hover:text-rose-700 transition-colors duration-150">
										delete
									</span>
								</button>
							</div>
						</>}
					</div>
					<div className="mx-auto w-full px-8 pt-4 pb-4 xl:pb-8 flex flex-row-reverse justify-between items-baseline gap-2">
						{/* top bar */}
						<button className="cursor-pointer" onClick={() => setisDrawerOpen(v => !v)}>
							<span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
								menu
							</span>
						</button>
						{isLoading &&
							<span className="material-symbols-outlined text-stone-500 animate-spin">
								progress_activity
							</span>}
					</div>
					<div className="mx-auto w-full flex-1 text-stone-700 overflow-y-auto 2xl:px-36 md:px-8 xl:px-24 px-4">
						{/* text editor */}
						<div className="flex justify-center">
							{(error && notePath) && <>
								<span className="material-symbols-outlined text-rose-700 mr-2">
									error
								</span>
								<p className="text-rose-700">Ошибка: {error}</p>
							</>}
						</div>
						{!isLoading && !error && currentNote && (
							<div>
								{currentNote.blocks && currentNote.blocks.map((block, idx) => (
									<div
										key={block.id || `block-${idx}`}
										className="mb-2 relative pr-2"
										onMouseEnter={() => handleBlockAreaMouseEnter(idx)}
										onMouseLeave={() => handleBlockAreaMouseLeave()}
									>
										<BlockMenu
											isVisible={activeMenuIndex === idx}
											onMenuInteraction={handleMenuInteraction}
											onMoveUp={() => handleMoveBlock(idx, 'up')}
											onMoveDown={() => handleMoveBlock(idx, 'down')}
											// Pass the blockType to handleAddBlockAfter
											onAddBlockAfter={(blockType) => handleAddBlockAfter(idx, blockType)}
											// Add the onDeleteBlock handler
											onDeleteBlock={() => handleDeleteBlock(idx)}
											isFirst={idx === 0}
											isLast={idx === currentNote.blocks.length - 1}
										/>
										{block.type === 'heading_one' && (
											<div className="grid relative">
												<span
													aria-hidden="true"
													className="pointer-events-none invisible break-all whitespace-pre-wrap py-1 col-start-1 row-start-1 font-semibold text-2xl"
												>
													{(block.content || "") + " "}
												</span>
												<textarea
													className="w-full outline-0 focus:bg-stone-200/85 bg-transparent text-stone-700 placeholder:text-stone-400 py-1 resize-none col-start-1 row-start-1 break-all overflow-x-hidden font-semibold text-2xl"
													value={block.content || ""}
													rows={1}
													placeholder="Заголовок"
													onChange={e => {
														const newContent = e.target.value;
														setCurrentNote(prev => ({
															...prev,
															blocks: prev.blocks.map((b, i) =>
																i === idx ? { ...b, content: newContent } : b
															)
														}));
													}}
													onBlur={async (e) => {
														const value = e.target.value;
														const blockExistsPredicate = (b_item, i_item) => (block.id && b_item.id === block.id) || i_item === idx;

														if (!currentNote.blocks.some(blockExistsPredicate)) return;

														const blocksToSend = currentNote.blocks.map((b, i) =>
															i === idx ? { ...b, content: value } : b
														);

														// Optimistically update state with the final blurred value
														setCurrentNote(prev => ({
															...prev,
															blocks: blocksToSend
														}));

														await updateExistingNote(currentNote.path, { blocks: blocksToSend });
													}}
												/>
											</div>
										)}
										{block.type === 'paragraph' && <div
											className="grid relative">
											<span
												aria-hidden="true"
												className="pointer-events-none invisible break-all whitespace-pre-wrap py-1 col-start-1 row-start-1"
											>
												{(block.content || "") + " "}
											</span>
											<textarea
												className="w-full outline-0 focus:bg-stone-200/85 text-stone-700 placeholder:text-stone-500 py-1 resize-none col-start-1 row-start-1 break-all overflow-x-hidden"
												value={block.content}
												rows={1}
												placeholder="Абзац..."
												onChange={e => {
													const newContent = e.target.value;
													setCurrentNote(prev => ({
														...prev,
														blocks: prev.blocks.map((b, i) =>
															i === idx ? { ...b, content: newContent } : b
														)
													}));
												}}
												onBlur={async (e) => {
													const value = e.target.value;
													const blockExistsPredicate = (b_item, i_item) => (block.id && b_item.id === block.id) || i_item === idx;

													if (!currentNote.blocks.some(blockExistsPredicate)) return;

													if (!value.trim()) { // Delete if empty
														const newBlocks = currentNote.blocks.filter((b, i) => !blockExistsPredicate(b, i));
														setCurrentNote(prev => ({ ...prev, blocks: newBlocks }));

														if (activeMenuIndex === idx) setActiveMenuIndex(null);
														else if (activeMenuIndex > idx) setActiveMenuIndex(prev => prev ? prev - 1 : null);

														await updateExistingNote(currentNote.path, { blocks: newBlocks });
													} else {
														const blocksToSend = currentNote.blocks.map((b, i) =>
															i === idx ? { ...b, content: value } : b
														);
														setCurrentNote(prev => ({ ...prev, blocks: blocksToSend }));
														await updateExistingNote(currentNote.path, { blocks: blocksToSend });
													}
												}}
											/>
										</div>}
										{block.type === 'divider' && (
											<div className="py-3">
												<hr className="border-stone-400/85" />
											</div>
										)}
									</div>
								))}
								<div
									className="grid relative mb-32">
									<span
										aria-hidden="true"
										className="pointer-events-none invisible whitespace-pre-wrap py-1 col-start-1 row-start-1 break-all"
									>
										{(newParagraph || "") + " "}
									</span>
									<textarea
										className="w-full outline-0 focus:bg-stone-200/85 text-stone-700 placeholder:text-stone-500 py-1 resize-none col-start-1 row-start-1 break-all overflow-x-hidden"
										placeholder="Нажмите сюда чтобы создать новый абзац."
										value={newParagraph}
										rows={1}
										onChange={e => setNewParagraph(e.target.value)}
										onBlur={async () => {
											if (!newParagraph.trim()) {
												setNewParagraph(""); // Clear if only spaces
												return;
											}
											const newBlock = {
												type: "paragraph",
												content: newParagraph,
												// properties: {}, // Only if your backend expects it
											};
											const updatedBlocks = currentNote.blocks ? [...currentNote.blocks, newBlock] : [newBlock];

											setCurrentNote(prev => ({
												...prev,
												blocks: updatedBlocks
											}));
											await updateExistingNote(currentNote.path, {
												blocks: updatedBlocks
											});
											setNewParagraph("");
										}}
									/>
								</div>
							</div>
						)}

						{!isLoading && !error && !currentNote && notePath && (
							<p>Заметка не найдена или к ней нет доступа.</p>
						)}
						{!isLoading && error && !currentNote && (!notePath || notePath === "/") && (
							<div className="text-center text-stone-500 mt-10">
								<p>Выберите заметку из списка или создайте новую.</p>
							</div>
						)}
					</div>
				</div>
			</div >
		</>
	);
}

export default Dashboard;