import { Card, Row, Col, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const templates = [
    {
        id: 1,
        title: "Փարիզյան զգեստով աղջիկ",
        url: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 2,
        title: "Տղա փողոցում գիշերով",
        url: "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 3,
        title: "Էսթետիկ տեսարան անապատում",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 4,
        title: "Սրճարան + aesthetic vibe",
        url: "https://images.unsplash.com/photo-1512374382149-e9fd62d38fbd?auto=format&fit=crop&w=800&q=80",
    },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "40px" }}>
            <Title level={2} style={{ textAlign: "center", color: "#531dab" }}>
                🎨 Ընտրիր aesthetic պատկերը
            </Title>
            <Row gutter={[24, 24]} justify="center">
                {templates.map((tpl) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={tpl.id}>
                        <Card
                            hoverable
                            cover={
                                <img
                                    alt={tpl.title}
                                    src={tpl.url}
                                    style={{ height: 250, objectFit: "cover" }}
                                />
                            }
                            onClick={() => navigate(`/swap?template=${tpl.id}`)}

                        >
                            <Card.Meta title={tpl.title} />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
