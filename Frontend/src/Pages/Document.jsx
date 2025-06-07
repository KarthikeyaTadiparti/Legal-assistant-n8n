import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import FileDropzone from "../components/FileDropzone";
import { useNavigate } from "react-router-dom";
import { addFile } from "../redux/slices/fileSlice";
function Document() {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const uploadedFiles = useSelector((state) => state.files.files);
    const handleSubmit = async () => {
        if (!file) {
            alert("Please select a file to upload!");
            return;
        }

        setIsLoading(true);
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                import.meta.env.VITE_DOCUMENT_UPLOAD_URL,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.status === 200) {
                console.log("File uploaded successfully:", response.data);
                // Store file information in Redux
                dispatch(addFile({
                    name: file.name,
                    type: file.type,
                    url: response.data.url
                }));
                navigate("/chatbot");
                setFile(null); // Clear file after upload
            } else {
                alert("Upload failed!");
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            alert("Error uploading files!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-custom-orange border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-custom-orange">Uploading your document...</p>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-semibold mb-6">
                        Upload Your Documents
                    </h1>
                    <FileDropzone
                        file={file}
                        setFile={setFile}
                        onSubmit={handleSubmit}
                    />
                </>
            )}
        </div>
    );
}

export default Document;
