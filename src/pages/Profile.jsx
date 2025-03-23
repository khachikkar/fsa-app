import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Card, Typography, Button } from "antd";

const { Title, Text } = Typography;

export default function Profile() {
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
            <Card style={{ width: 400 }}>
                <Title level={3}>👤 Պրոֆիլ</Title>
                {user ? (
                    <>
                        <Text>📧 {user.email}</Text>
                        <Button onClick={handleLogout} danger block style={{ marginTop: "20px" }}>Դուրս գալ</Button>
                    </>
                ) : (
                    <Text>Բեռնվում է...</Text>
                )}
            </Card>
        </div>
    );
}
