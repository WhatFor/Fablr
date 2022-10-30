import React, { useEffect, useRef, useState } from "react";

interface Props {
    id: string,
    title: string,
    body: string,
    onBodyTextChange: (id: string, value: string) => void,
    onTitleTextChange: (id: string, value: string) => void,
    onCloseFlyout: () => void,
}

const NodeEditorFlyout = ({ id, title, body, onBodyTextChange, onTitleTextChange, onCloseFlyout }: Props) => {

    const titleInputRef = useRef<HTMLInputElement>(null);
    const [titleText, setTitleText] = useState<string>(title);
    const [bodyText, setBodyText] = useState<string>(body);

    useEffect(() => {
        titleInputRef?.current?.focus();
    }, []);

    useEffect(() => {
        setTitleText(title);
        setBodyText(body);
    }, [ id ]);

    const handleTitleChange = (evt: React.FormEvent<HTMLInputElement>) => {
        const val = evt.currentTarget.value;
        onTitleTextChange(id, val);
        setTitleText(val);
    };

    const handleBodyChange = (evt: React.FormEvent<HTMLTextAreaElement>) => {
        const val = evt.currentTarget.value;
        onBodyTextChange(id, val);
        setBodyText(val);
    };

    return (
        <div
            style={{ top: "195px", right: "40px", height: "calc(100vh - 228px)" }}
            className="absolute w-1/3 bg-black border-white border-4 z-40">
            <div className="flex flex-col px-3">
                <p className="font-mono text-base uppercase text-white">
                    Editing Node
                </p>

                <label htmlFor="title" className="text-white uppercase font-mono text-sm">Title</label>
                <input
                    ref={titleInputRef}
                    id="title"
                    autoComplete="off"
                    value={titleText}
                    className="bg-black text-sm font-mono text-white uppercase mb-3 border-4 border-white px-4"
                    onChange={handleTitleChange} />

                <label htmlFor="text" className="text-white uppercase font-mono text-sm">Text</label>
                <textarea
                    title="text"
                    id="text"
                    autoComplete="off"
                    value={bodyText}
                    style={{ minHeight: "35vh" }}
                    className="bg-black text-sm font-mono text-white uppercase border-4 border-white px-3 mb-6 leading-6"
                    onChange={handleBodyChange} />

                <button
                    onClick={onCloseFlyout}
                    className="border-4 px-6 leading-8 pb-1 mb-6 text-white font-mono text-sm uppercase hover:text-gray-300 hover:cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    );
};

export default NodeEditorFlyout;