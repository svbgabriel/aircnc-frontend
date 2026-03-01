import {useEffect, useState} from "react";
import {Link} from "react-router";
import {api} from "~/services/api";
import "./styles.css";

interface Spot {
    _id: string;
    thumbnail_url: string;
    company: string;
    price: number | null;
}

interface User {
    email: string;
}

interface BookingRequest {
    _id: string;
    user: User;
    spot: Spot;
    date: string;
}

interface WebSocketEvent {
    event: string;
    data: BookingRequest;
}

export default function Dashboard() {
    const [spots, setSpots] = useState<Spot[]>([]);
    const [requests, setRequests] = useState<BookingRequest[]>([]);

    useEffect(() => {
        const user_id = localStorage.getItem("user");
        if (!user_id) return;

        const ws = new WebSocket(`ws://localhost:9090/websocket?user_id=${user_id}`);

        ws.onmessage = (event) => {
            const message: WebSocketEvent = JSON.parse(event.data);

            if (message.event === "booking_request") {
                setRequests(prev => [...prev, message.data]);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        async function loadSpots(): Promise<void> {
            const user_id = localStorage.getItem("user");
            const response = await api.get("/dashboard", {
                headers: {user_id}
            });

            setSpots(response.data);
        }

        loadSpots();
    }, []);

    async function handleAccept(id: string): Promise<void> {
        await api.post(`/bookings/${id}/approvals`);
        setRequests(prev => prev.filter(request => request._id !== id));
    }

    async function handleReject(id: string): Promise<void> {
        await api.post(`/bookings/${id}/rejections`);
        setRequests(prev => prev.filter(request => request._id !== id));
    }

    return (
        <>
            <ul className="notifications">
                {requests.map(request => (
                    <li key={request._id}>
                        <p>
                            <strong>{request.user.email}</strong> está solicitando uma reserva{" "}
                            <strong>{request.spot.company}</strong> para a data:{" "}
                            <strong>{request.date}</strong>
                        </p>
                        <button
                            className="accept"
                            onClick={() => handleAccept(request._id)}
                        >
                            ACEITAR
                        </button>
                        <button
                            className="reject"
                            onClick={() => handleReject(request._id)}
                        >
                            REJEITAR
                        </button>
                    </li>
                ))}
            </ul>
            <ul className="spot-list">
                {spots.map(spot => (
                    <li key={spot._id}>
                        <header style={spot.thumbnail_url ? {backgroundImage: `url(${spot.thumbnail_url})`} : {}}/>
                        <strong>{spot.company}</strong>
                        <span>{spot.price ? `R$${spot.price}/dia` : "GRATUITO"}</span>
                    </li>
                ))}
            </ul>
            <Link to="/new">
                <button className="btn">Cadastrar novo spot</button>
            </Link>
        </>
    );
}
