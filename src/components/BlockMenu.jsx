import React, { useState, useEffect, useRef } from 'react';

const BlockMenu = ({
    isVisible,
    onMenuInteraction,
    onMoveUp,
    onMoveDown,
    onAddBlockAfter,
    onDeleteBlock,
    isFirst,
    isLast
}) => {
    const [showAddOptions, setShowAddOptions] = useState(false);
    const addOptionsRef = useRef(null);
    const mainAddButtonRef = useRef(null);

    useEffect(() => {
        if (!isVisible) {
            setShowAddOptions(false);
        }
    }, [isVisible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mainAddButtonRef.current && mainAddButtonRef.current.contains(event.target)) {
                return;
            }
            if (addOptionsRef.current && !addOptionsRef.current.contains(event.target)) {
                setShowAddOptions(false);
            }
        };

        if (showAddOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddOptions]);


    const handleAddOptionClick = (type) => {
        onAddBlockAfter(type);
        setShowAddOptions(false);
        onMenuInteraction();
    };

    const createInteractiveHandler = (handler) => () => {
        if (handler) handler();
        onMenuInteraction();
    };

    return (
        <div
            className={`absolute -left-12 top-0 z-10 flex flex-col gap-0.5 rounded-lg shadow-button bg-stone-50/85 transition-opacity ease-out duration-150 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onMouseEnter={onMenuInteraction}
        >
            <button
                onClick={createInteractiveHandler(onMoveUp)}
                disabled={isFirst}
                className=" hover:bg-stone-200 hover:opacity-100 opacity-85 rounded-lg disabled:hidden transition ease-out duration-150 disabled:cursor-not-allowed flex items-center justify-center"
                title="Подвинуть вверх"
                onFocus={onMenuInteraction}
            >
                <span className="material-symbols-outlined text-stone-700">keyboard_arrow_up</span>
            </button>
            <button
                onClick={createInteractiveHandler(onMoveDown)}
                disabled={isLast}
                className=" hover:bg-stone-200 hover:opacity-100 opacity-85 rounded-lg disabled:hidden transition ease-out duration-150 disabled:cursor-not-allowed flex items-center justify-center"
                title="Подвинуть вниз"
                onFocus={onMenuInteraction}
            >
                <span className="material-symbols-outlined text-stone-700">keyboard_arrow_down</span>
            </button>
            <div className="relative mt-1">
                <button
                    ref={mainAddButtonRef}
                    onClick={() => { setShowAddOptions(prev => !prev); onMenuInteraction(); }}
                    className="hover:bg-stone-200 hover:opacity-100 opacity-85 rounded-lg transition ease-out duration-150 flex items-center justify-center"
                    title="Добавить блок"
                    aria-haspopup="true"
                    aria-expanded={showAddOptions}
                    onFocus={onMenuInteraction}
                >
                    <span className="material-symbols-outlined text-stone-700">add</span>
                </button>

                {showAddOptions && (
                    <div
                        ref={addOptionsRef}
                        className="absolute left-full top-0 ml-1 w-max flex flex-col gap-1 rounded-lg shadow-button backdrop-blur-xs bg-stone-50/85 z-20"
                        onMouseEnter={onMenuInteraction}
                    >
                        <button
                            onClick={() => handleAddOptionClick('paragraph')}
                            className="text-left text-sm text-stone-700 hover:bg-stone-200 px-2 py-1 rounded-lg w-full transition ease-out duration-150 flex items-center gap-2"
                            onFocus={onMenuInteraction}
                        >
                            <span className="material-symbols-outlined text-stone-700 leading-none">format_paragraph</span>
                            Абзац
                        </button>
                        <button
                            onClick={() => handleAddOptionClick('heading_one')}
                            className="text-left text-sm text-stone-700 hover:bg-stone-200 px-2 py-1 rounded-lg w-full transition ease-out duration-150 flex items-center gap-2"
                            onFocus={onMenuInteraction}
                        >
                            <span className="material-symbols-outlined text-stone-700 leading-none">title</span>
                            Заголовок
                        </button>
                        <button
                            onClick={() => handleAddOptionClick('divider')}
                            className="text-left text-sm text-stone-700 hover:bg-stone-200 px-2 py-1 rounded-lg w-full transition ease-out duration-150 flex items-center gap-2"
                            onFocus={onMenuInteraction}
                        >
                            <span className="material-symbols-outlined text-stone-700 leading-none">horizontal_rule</span>
                            Разделитель
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={createInteractiveHandler(onDeleteBlock)}
                className="hover:bg-stone-200 hover:text-rose-700 rounded-lg text-stone-700 opacity-85 transition ease-out duration-150 flex items-center justify-center"
                title="Удалить блок"
                onFocus={onMenuInteraction}
            >
                <span className="material-symbols-outlined">delete</span>
            </button>
        </div>
    );
};

export default BlockMenu;