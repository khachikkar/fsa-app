import { Card, Row, Col, Typography, Image, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Home.css"; // բենտո ստայլի համար առանձին css



const { Title } = Typography;

export default function Home() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            const { data, error } = await supabase
                .from("templates")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("❌ Template fetch error:", error);
            } else {
                setTemplates(data);
            }
            setLoading(false);
        };

        fetchTemplates();
    }, []);

    if (loading) return <Spin fullscreen />;

    return (
        <div className="bento-container">
            <Title level={2} style={{ textAlign: "center", marginBottom: 30, color: "#531dab" }}>
                🖼️ Ընտրիր aesthetic պատկեր swap-ի համար
            </Title>

            <div className="bento-grid">
                {templates.map((tpl) => (
                    <div
                        key={tpl.id}
                        className="bento-item"
                        onClick={() => navigate(`/swap?template=${tpl.id}`)}
                    >
                        <Image
                            src={tpl.url}
                            alt={tpl.title}
                            preview={false}
                            style={{ borderRadius: "12px", height: "100%", objectFit: "cover" }}
                        />
                        <div className="bento-title">{tpl.title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
