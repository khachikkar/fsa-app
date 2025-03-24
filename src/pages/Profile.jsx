import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Typography, Button, Image, Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setResults } from "../../results/resultsSlice";
import "./Profile.css"; // մենք գրելու ենք CSS-ն էլ

const { Title, Text } = Typography;

export default function Profile() {
    const dispatch = useDispatch();
    const results = useSelector((state) => state.results.results);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data?.user) {
                navigate("/login");
            } else {
                setUser(data.user);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("results")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!error) {
                dispatch(setResults(data));
            }
        };

        fetchResults();
    }, [dispatch]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    if (!user) return <Spin fullscreen />;

    return (
        <div className="profile-container">
            {/* 👤 Header Section */}
            <div className="profile-header">
                <Text className="user-email">📧 {user.email}</Text>
                <Button onClick={handleLogout} danger type="primary">
                    Դուրս գալ
                </Button>
            </div>

            {/* 🧠 Results */}
            <div className="results-section">
                <Title level={3}>🖼️ Քո FaceSwap Արդյունքները</Title>
                <Button type="primary" onClick={()=>navigate("/")} >Փորձել նկարները՜</Button>
                {results.length > 0 ? (
                    <div className="results-grid">
                        {results.map((res, index) => (
                            <div key={index} className="result-item">
                                <img src={res.image_url} alt="result" />
                                <Button
                                    type="primary"
                                    onClick={async () => {
                                        const response = await fetch(res.image_url);
                                        const blob = await response.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = "faceswap_result.jpg";
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    block
                                    style={{ marginTop: 10 }}
                                >
                                    Ներբեռնել
                                </Button>
                                <p className="result-date">
                                    {new Date(res.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Դուք դեռ FaceSwap չեք արել։</p>
                )}
            </div>
        </div>
    );
}
