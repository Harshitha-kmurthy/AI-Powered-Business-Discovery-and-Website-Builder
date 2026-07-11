import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import "./WebsiteBuilder.css";

function WebsiteBuilder() {

    const navigate = useNavigate();
    const location = useLocation();

    const business = location.state?.business;

    const [loading, setLoading] = useState(false);

    // live-updating text, used ONLY for the textarea while streaming
    const [streamingHtml, setStreamingHtml] = useState("");

    // stable, complete HTML — used for the iframe preview and download
    const [generatedHtml, setGeneratedHtml] = useState("");

    if (!business) {
        return (
            <div className="wb-error">
                <h2>No Business Selected</h2>

                <button onClick={() => navigate("/dashboard")}>
                    Back To Dashboard
                </button>
            </div>
        );
    }

    const generateWebsite = async () => {
        setLoading(true);
        setStreamingHtml("");
        setGeneratedHtml("");

        try {
            const payload = {
                name: business.name,
                type: business.type || business.category,
                address: business.address,
                phone: business.phone || "",
                website: business.website || "",
                email: business.email || "",
                lat: business.lat,
                lon: business.lon
            };

            const baseURL = API.defaults.baseURL || "";

            const response = await fetch(`${baseURL}/website/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok || !response.body) {
                throw new Error("Stream failed");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let accumulated = "";

            while (true) {
                const { value, done } = await reader.read();

                if (done) break;

                accumulated += decoder.decode(value, { stream: true });

                // textarea updates live, word by word
                setStreamingHtml(accumulated);
            }

            // iframe only receives the HTML once it's fully complete
            setGeneratedHtml(accumulated);

        } catch (error) {
            alert("Website Generation Failed");
        }

        setLoading(false);
    };

    const downloadHTML = () => {

        if (!generatedHtml) {

            alert("Generate website first");

            return;
        }

        const blob = new Blob(
            [generatedHtml],
            {
                type: "text/html"
            }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = `${business.name}.html`;

        a.click();

        URL.revokeObjectURL(url);

    };

    // whichever the textarea should show right now:
    // while generating -> live streaming text
    // once done / after manual edits -> the stable generatedHtml
    const editorValue = loading ? streamingHtml : generatedHtml;

    const handleEditorChange = (e) => {
        // manual edits always go to the stable state, since that's
        // what drives the iframe and the download
        setGeneratedHtml(e.target.value);
    };

    return (

        <div className="wb-container">

            <div className="wb-header">

                <h1>

                    AI Website Builder

                </h1>

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >

                    ← Dashboard

                </button>

            </div>

            <div className="business-card">

                <h2>Business Information</h2>

                <div className="info-grid">

                    <div>

                        <label>Name</label>

                        <span>{business.name}</span>

                    </div>

                    <div>

                        <label>Category</label>

                        <span>{business.type}</span>

                    </div>

                    <div>

                        <label>Phone</label>

                        <span>{business.phone || "-"}</span>

                    </div>

                    <div>

                        <label>Email</label>

                        <span>{business.email || "-"}</span>

                    </div>

                    <div>

                        <label>Website</label>

                        <span>{business.website || "No Website"}</span>

                    </div>

                    <div>

                        <label>Address</label>

                        <span>{business.address}</span>

                    </div>

                    <div>

                        <label>Latitude</label>

                        <span>{business.lat}</span>

                    </div>

                    <div>

                        <label>Longitude</label>

                        <span>{business.lon}</span>

                    </div>

                </div>

            </div>

            <div className="action-bar">

                <button
                    className="generate-btn"
                    onClick={generateWebsite}
                    disabled={loading}
                >

                    {

                        loading ?

                            "Generating..." :

                            "Generate Website"

                    }

                </button>

                <button
                    className="download-btn"
                    onClick={downloadHTML}
                >

                    Download HTML

                </button>

            </div>

            <div className="editor-preview">

                <div className="editor-panel">

                    <h3>HTML Editor</h3>

                    <textarea

                        value={editorValue}

                        onChange={handleEditorChange}

                    />

                </div>

                <div className="preview-panel">

                    <h3>Live Preview</h3>

                    <iframe

                        title="preview"

                        srcDoc={generatedHtml}

                    />

                </div>

            </div>

        </div>

    );

}

export default WebsiteBuilder;