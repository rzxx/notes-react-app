import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import GradientBackground from "../components/GradientBackground";
import ItemsList from "../components/ItemsList";

const API_BASE_URL = 'http://127.0.0.1:3000';

const Dashboard = () => {
	const params = useParams();
	const notePath = params['*'];
	const navigate = useNavigate();

	const [currentNote, setCurrentNote] = useState(null);
	const [allNotes, setAllNotes] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const [newParagraph, setNewParagraph] = useState("");

	const [isDrawerOpen, setisDrawerOpen] = useState(false);
	const [isMobileMenuOpen, setisMobileMenuOpen] = useState(false);

	const getToken = () => localStorage.getItem('token');

	const fetchAllNotes = useCallback(async () => {
		const token = getToken();
		if (!token) {
			navigate("/");
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
				throw new Error(errData.error || `Failed to fetch all notes: ${response.status}`);
			}
			const data = await response.json();
			setAllNotes(data);
		} catch (err) {
			console.error("Fetch all notes error:", err);
			// setError(err.message); // Or a specific error state for the list
		}
	}, [navigate]);

	const fetchNoteByPath = useCallback(async (path) => {
		setisDrawerOpen(false);
		if (!path && path !== '') { // Allow empty string for root path "/"
			setCurrentNote(null); // No specific note to fetch if path is truly undefined
			return;
		}
		setIsLoading(true);
		setError(null);
		const token = getToken();
		if (!token) {
			navigate("/"); // Redirect to login if no token
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
				} else {
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
			setCurrentNote(null);
		} finally {
			setIsLoading(false);
		}
	}, [navigate]);

	useEffect(() => {
		fetchAllNotes(); // Fetch all notes on component mount or when user changes
	}, [fetchAllNotes]); // Add fetchAllNotes to dependency array

	useEffect(() => {
		// Ensure notePath is defined before fetching, or handle root path explicitly
		if (notePath !== undefined) {
			fetchNoteByPath(notePath);
		} else {
			// Handle the case where notePath is undefined, maybe fetch a default note or clear currentNote
			setCurrentNote(null); // Example: clear current note if path is undefined
		}
	}, [notePath, fetchNoteByPath]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate("/");
	};

	const createNewNote = async () => { // Removed noteData from parameters
		setIsLoading(true);
		setError(null);
		const token = getToken();
		if (!token) {
			navigate("/");
			return null;
		}
		try {
			const baseTitle = "Новая заметка"; // Default title
			const basePath = "new-note"; // Base for path generation

			// Filter notes to find existing paths like "/new-note", "/new-note-2", etc.
			const existingNotesWithBasePath = allNotes.filter(
				n => n.path === `/${basePath}` || n.path.startsWith(`/${basePath}-`)
			);

			// Find next available path
			let nextPath = `/${basePath}`;
			if (existingNotesWithBasePath.some(n => n.path === nextPath)) {
				let i = 2;
				while (existingNotesWithBasePath.some(n => n.path === `/${basePath}-${i}`)) {
					i++;
				}
				nextPath = `/${basePath}-${i}`;
			}

			const response = await fetch(`${API_BASE_URL}/api/notes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					title: baseTitle, // Use the default title
					path: nextPath,
					blocks: [] // Initialize with empty blocks
				})
			});
			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.error || `Failed to create note: ${response.status}`);
			}
			const newNote = await response.json();
			fetchAllNotes(); // Refresh the list of all notes
			navigate(`/dashboard${newNote.path}`); // Navigate to the newly created note
			return newNote;
		} catch (err) {
			console.error("Create note error:", err);
			setError(err.message);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const updateExistingNote = async (path, updateData) => {
		setIsLoading(true);
		setError(null);
		const token = getToken();
		if (!token) {
			navigate("/");
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
				throw new Error(errData.error || `Failed to update note: ${response.status}`);
			}
			const updatedNote = await response.json();
			setCurrentNote(updatedNote); // Update current note state
			fetchAllNotes();
			// Optionally, refresh notes list if path was changed
			if (updateData.path && updateData.path !== apiPath) {
				navigate(`/dashboard${updateData.path}`);
			}
			return updatedNote;
		} catch (err) {
			console.error("Update note error:", err);
			setError(err.message);
			return null;
		} finally {
			setIsLoading(false);
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
				throw new Error(errData.error || `Failed to delete note: ${response.status}`);
			}

			// Success
			setisDrawerOpen(false); // Close drawer
			setCurrentNote(null); // Clear current note
			navigate(`/dashboard${allNotes[1].path}`); // Navigate to a default/home path
			fetchAllNotes(); // Refresh the list of all notes
			// Optionally, show a success message
		} catch (err) {
			console.error("Delete note error:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<GradientBackground />

			{/* desktop navbar */}
			<div className="w-dvw px-14 xl:grid grid-cols-3 hidden py-4">
				<Link to="/" className="text-lg font-black text-stone-700/85 hidden xl:block">Grainy Notes</Link>

				<div className={`flex flex-col justify-center items-center text-center transition-opacity duration-300 ease-out ${isDrawerOpen && 'opacity-0'}`}>
					{isLoading
						? <h4 className="text-xl font-black text-stone-500 opacity-85 animate-pulse">Загрузка...</h4>
						: (currentNote
							? <h4 className="text-xl font-black text-transparent bg-linear-to-tr from-yellow-900/85 to-rose-900/85 bg-clip-text cursor-default">{currentNote.title.trim()
								? currentNote.title : "Нет названия"}</h4>
							: <h4 className="text-xl font-black text-rose-800/70">Заметка не найдена.</h4>)
					}
					<p className="text-sm text-stone-700/85 cursor-default">/{notePath}</p>
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
							<p className="text-stone-500/85 text-sm">Пользователь</p>
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
						<div className="flex-1 min-h-0 w-full flex items-center-safe overflow-y-auto no-scrollbar mb-2">
							<ItemsList currentPath={notePath} items={allNotes} createNote={createNewNote} />
						</div>
					</>}
				</div>
			</div>

			<div className="w-dvw relative"
				style={{ height: "calc(100vh - 5rem)" }}>
				<div className="absolute px-14 h-full left-0 top-0 xl:flex flex-col gap-2 hidden">
					<div className="flex-1 min-w-42 flex items-center-safe overflow-y-auto max-h-full no-scrollbar">
						<ItemsList currentPath={notePath} items={allNotes} createNote={createNewNote} />
					</div>

					<div className="mb-6">
						<p className="text-stone-500/85 text-sm mb-1">Пользователь</p>
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
				<div className="2xl:max-w-5xl w-full xl:max-w-4xl xl:mx-auto h-full bg-stone-50/85 rounded-t-4xl shadow-box overflow-clip flex flex-col">
					<div className={`mx-auto md:px-8 px-4 bg-stone-200 w-full overflow-hidden duration-300 transition-all ease-out relative ${isDrawerOpen ? 'max-h-full py-8 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
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
							{error && <>
								<span className="material-symbols-outlined text-rose-700 mr-2">
									error
								</span>
								<p className="text-rose-700">Ошибка: {error}</p>
							</>}
						</div>
						{!isLoading && !error && currentNote && (
							<div>
								{/* Для новых элементов надо будет делать проверку */}
								{/* {currentNote.blocks.map((block) => (
                                    <div key={block.id} className="mb-2">
                                        {block.type === 'heading_one' && <h1>{block.content}</h1>}
                                        {block.type === 'paragraph' && <textarea className="w-full outline-0 focus:bg-stone-200 text-stone-700 py-1" value={block.content} />}
                                        {block.type === 'divider' && <hr className="my-2" />}
                                    </div>
                                ))} */}
								{currentNote.blocks.map((block, idx) => (
									<div key={idx} className="mb-2">
										{block.type === 'heading_one' && <h1>{block.content}</h1>}
										{block.type === 'paragraph' && <div
											className="grid relative">
											<span
												aria-hidden="true"
												className="pointer-events-none invisible break-all whitespace-pre-wrap py-1 col-start-1 row-start-1"
											>
												{(block.content || "") + " "}
											</span>
											<textarea
												className="w-full outline-0 focus:bg-stone-200 text-stone-700 placeholder:text-stone-500 py-1 resize-none col-start-1 row-start-1 break-all overflow-x-hidden"
												value={block.content}
												rows={1}
												onChange={e => {
													setCurrentNote(prev => ({
														...prev,
														blocks: prev.blocks.map((b, i) =>
															i === idx ? { ...b, content: e.target.value } : b
														)
													}));
												}}
												onBlur={async (e) => {
													const value = e.target.value;
													if (!value.trim()) {
														const newBlocks = currentNote.blocks.filter((_, i) => i !== idx);
														setCurrentNote(prev => ({
															...prev,
															blocks: newBlocks
														}));
														await updateExistingNote(currentNote.path, {
															blocks: newBlocks
														});
													} else {
														await updateExistingNote(currentNote.path, {
															blocks: currentNote.blocks
														});
													}
												}}
											/>
										</div>}
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
										className="w-full outline-0 focus:bg-stone-200 text-stone-700 placeholder:text-stone-500 py-1 resize-none col-start-1 row-start-1 break-all overflow-x-hidden"
										placeholder="Нажмите сюда чтобы создать новый абзац."
										value={newParagraph}
										rows={1}
										onChange={e => setNewParagraph(e.target.value)}
										onBlur={async () => {
											if (!newParagraph.trim()) return;
											// Создаем новый блок
											const newBlock = {
												type: "paragraph",
												content: newParagraph,
												properties: {},
											};
											// Обновляем заметку на сервере
											await updateExistingNote(currentNote.path, {
												blocks: [...currentNote.blocks, newBlock]
											});
											// Очищаем инпут
											setNewParagraph("");
										}}
									/>
								</div>
							</div>
						)}
						{!isLoading && !error && !currentNote && notePath && (
							<p>Заметка не найдена или к ней нет доступа.</p>
						)}
					</div>
				</div>
			</div >
		</>
	);
}

export default Dashboard;