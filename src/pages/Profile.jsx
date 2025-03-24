import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Card, Typography, Button, Row, Col, Image } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setResults } from "../../results/resultsSlice";



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

            if (error) {
                console.error("🔴 DB fetch error:", error);
            } else {
                dispatch(setResults(data));
            }
        };

        fetchResults();
    }, [dispatch]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f2f5"
        }}>
            <Card style={{width: 400}}>
                <Title level={3}>👤 Պրոֆիլ</Title>
                {user ? (
                    <>
                        <Text>📧 {user.email}</Text>
                        <Button onClick={handleLogout} danger block style={{marginTop: "20px"}}>Դուրս գալ</Button>
                    </>
                ) : (
                    <Text>Բեռնվում է...</Text>
                )}
            </Card>
            <div style={{padding: "40px"}}>
                <Title level={2}>👤 Քո FaceSwap Արդյունքները</Title>

                <Row gutter={[16, 16]}>
                    {results.length > 0 ? (
                        results.map((res, index) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={index}>
                                <Card hoverable>
                                    <Image
                                        src={res.image_url}
                                        alt="Swap Result"
                                        width="100%"
                                        style={{borderRadius: 10}}
                                    />
                                    <p style={{marginTop: 8, fontSize: "12px", color: "#999"}}>
                                        {new Date(res.created_at).toLocaleString()}
                                    </p>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <p>Դուք դեռ FaceSwap չեք արել։</p>
                    )}
                </Row>
            </div>
        </div>
    );
}


// import { useSelector, useDispatch } from "react-redux";
// import { useEffect } from "react";
// import { setResults } from "../../results/resultsSlice";
// import { supabase } from "../../supabaseClient";
// import { Row, Col, Card, Image, Typography } from "antd";
//
// const { Title } = Typography;
//
// export default function Profile() {
//     const dispatch = useDispatch();
//     const results = useSelector((state) => state.results.results);
//
//     useEffect(() => {
//         const fetchResults = async () => {
//             const { data: { user } } = await supabase.auth.getUser();
//             if (!user) return;
//
//             const { data, error } = await supabase
//                 .from("results")
//                 .select("*")
//                 .eq("user_id", user.id)
//                 .order("created_at", { ascending: false });
//
//             if (error) {
//                 console.error("🔴 DB fetch error:", error);
//             } else {
//                 dispatch(setResults(data));
//             }
//         };
//
//         fetchResults();
//     }, [dispatch]);
//
//     return (
//         <div style={{ padding: "40px" }}>
//             <Title level={2}>👤 Քո FaceSwap Արդյունքները</Title>
//             <Row gutter={[16, 16]}>
//                 {results.length > 0 ? (
//                     results.map((res, i) => (
//                         <Col xs={24} sm={12} md={8} lg={6} key={i}>
//                             <Card hoverable>
//                                 <Image src={res.image_url} alt="result" width="100%" />
//                                 <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
//                                     📅 {new Date(res.created_at).toLocaleString()}
//                                 </p>
//                             </Card>
//                         </Col>
//                     ))
//                 ) : (
//                     <p>Դուք դեռ արդյունք չունեք։ Փորձե՛ք FaceSwap 😉</p>
//                 )}
//             </Row>
//         </div>
//     );
// }
