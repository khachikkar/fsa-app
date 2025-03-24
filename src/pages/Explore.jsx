import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Typography, Spin } from "antd";
import "./Explore.css"; // բենտո գրիդի CSS

const { Title } = Typography;

export default function Explore() {

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const { data, error } = await supabase
                .from("results")
                .select("image_url, created_at")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("❌ Fetch error:", error);
            } else {
                setResults(data);
            }

            setLoading(false);
        };

        fetchResults();
    }, []);

    if (loading) return <Spin fullscreen />;

    return (
        <div className="explore-container">
            <Title level={2} style={{ textAlign: "center", color: "#722ed1", marginBottom: 30 }}>
                🌍 Community Explore
            </Title>

            <div className="explore-grid">
                {results.map((res, index) => (
                    <div key={index} className="explore-item">
                        <img src={res.image_url} alt="Swap result"/>
                        <div className="explore-caption">
                            🕓 {new Date(res.created_at).toLocaleString("hy-AM")}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
