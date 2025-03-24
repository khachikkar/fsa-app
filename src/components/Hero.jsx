import { Typography, Button, Image } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function Hero() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "60px 20px",
            background: "linear-gradient(to right, #f9f0ff, #e6f7ff)",
            borderRadius: "20px",
            marginBottom: "60px"
        }}>
            <div style={{ flex: 1, minWidth: 300, paddingRight: 40 }}>
                <Title level={2} style={{ color: "#531dab" }}>
                    🤖 Փոխիր դեմքդ ցանկացած aesthetic նկարում
                </Title>
                <Paragraph style={{ fontSize: 16, color: "#555" }}>
                    Մեր AI FaceSwap հավելվածը թույլ է տալիս ընտրել գեղեցիկ պատկերներ և տեղադրել քո դեմքը դրանց վրա՝ առանց դիզայնի կամ ֆոտոշոփի փորձի։
                    Պատկերացրու՝ դու Փարիզում, անապատում կամ 90-ական aesthetic տեսքով։
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/login")}
                >
                    🚀 Սկսել FaceSwap-ը
                </Button>
            </div>

            <div style={{ flex: 1, minWidth: 300 }}>
                <Image.PreviewGroup>
                    <Image
                        src="https://plus.unsplash.com/premium_photo-1673734625669-7ef119c3ef65?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fHw%3D"
                        width={250}
                        style={{ borderRadius: 12, marginRight: 10 }}
                    />
                    <Image
                        src="https://ekppkvliqumfeubehpft.supabase.co/storage/v1/object/public/results/965631b2-5673-412a-9c2a-23becea7ac8e_1742814620888.jpg"
                        width={250}
                        style={{ borderRadius: 12 }}
                    />
                </Image.PreviewGroup>
            </div>
        </div>
    );
}
