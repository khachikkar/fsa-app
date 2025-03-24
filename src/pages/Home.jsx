import {Typography, Spin, Button} from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Home.css";
import Explore from "./Explore";
import Hero from "../components/Hero";




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

    // 🔐 Template սեղմելու դեպքում՝ ստուգում ենք մուտք գործած user-ը
    const handleTemplateClick = async (id) => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
            navigate(`/swap?template=${id}`);
        } else {
            navigate(`/login?redirect=/swap?template=${id}`);
        }
    };

    if (loading) return <Spin fullscreen />;

    return (
        <div className="bento-container">

            <Hero />

            <Title level={2} style={{ textAlign: "center", marginBottom: 30, color: "#531dab" }}>
                🖼️ Ընտրիր aesthetic պատկեր swap-ի համար
            </Title>
            <Button type="primary" onClick={() => navigate("/profile")}>Իմ Պրոֆիլը</Button>

            <div className="bento-grid">
                {templates.map((tpl) => (
                    <div
                        key={tpl.id}
                        className="bento-item"
                        onClick={() => handleTemplateClick(tpl.id)}
                    >
                        <img src={tpl.url} alt={tpl.title} />
                        <div className="bento-title">{tpl.title}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "60px" }}>
                <Explore />
            </div>
        </div>
    );
}
