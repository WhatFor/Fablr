
import React, { useEffect, useRef, useState } from "react";

interface Props {
    id: string,
    text: string,
    onTextChange: (id: string, value: string) => void,
    onCloseFlyout: () => void,
}

const EdgeEditorFlyout = ({ id, text, onTextChange, onCloseFlyout }: Props) => {

    const textInputRef = useRef<HTMLInputElement>(null);
    const [textValue, setTextValue] = useState<string>(text);

    useEffect(() => {
        textInputRef?.current?.focus();
    }, []);

    useEffect(() => {
        setTextValue(text);
    }, [ id ]);

    const handleTextChange = (evt: React.FormEvent<HTMLInputElement>) => {
        const val = evt.currentTarget.value;
        onTextChange(id, val);
        setTextValue(val);
    };

    return (
        <div
            style={{ top: "195px", right: "40px", height: "calc(100vh - 228px)" }}
            className="absolute w-1/3 bg-black border-white border-4 z-40">
            <div className="flex flex-col px-3">
                <p className="font-mono text-base uppercase text-white">
                    Editing Option
                </p>

                <label htmlFor="text" className="text-white uppercase font-mono text-sm">Text</label>
                <input
                    ref={textInputRef}
                    id="text"
                    autoComplete="off"
                    value={textValue}
                    className="bg-black text-sm font-mono text-white uppercase mb-3 border-4 border-white px-4"
                    onChange={handleTextChange} />

                <button
                    onClick={onCloseFlyout}
                    className="border-4 px-6 leading-8 pb-1 mb-6 text-white font-mono text-sm uppercase hover:text-gray-300 hover:cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    );
};

export default EdgeEditorFlyout;