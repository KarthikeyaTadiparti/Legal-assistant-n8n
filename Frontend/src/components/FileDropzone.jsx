import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineFileUpload } from "react-icons/md";

const FileDropzone = ({ file, setFile, onSubmit }) => {
    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const newFile = acceptedFiles[0];
            setFile(newFile);
        }
    };

    const handleRemove = (event, filename) => {
        event.stopPropagation(); // Prevent event bubbling
        setFiles((prevFiles) =>
            prevFiles.filter((file) => file.name !== filename)
        );
    };

    // Cleanup to revoke object URL (Avoid memory leak)
    useEffect(() => {
        return () => {
            if (file) {
                URL.revokeObjectURL(file.preview);
            }
        };
    }, [file]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif"],
            "application/pdf": [".pdf"],
        },
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                {...getRootProps()}
                className={`h-[250px] flex flex-col border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition w-[800px] ${
                    isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-gray-100"
                }`}
            >
                <input {...getInputProps()} />
                <p className="text-gray-700">
                    Drag & drop some files here, or click to select files
                </p>
                {file ? (
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="border-2 rounded-md p-2 flex items-center gap-2">
                            {file.type.startsWith("image") && (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                            )}
                            <p className="text-gray-600">{file.name}</p>
                            <button
                                onClick={() => setFile(null)}
                                className="ml-auto text-gray-700 px-2 py-1 rounded transition"
                                aria-label="Remove file"
                            >
                                <RxCross2 />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center mt-8 text-gray-300">
                        <MdOutlineFileUpload style={{ "fontSize": "100px" }} />
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                className={`mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${
                    !file ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!file} // Disable button if no file
            >
                Submit File
            </button>
        </div>
    );
};

export default FileDropzone;
