import React, {useState, useMemo} from "react";
import {api} from "~/services/api";
import camera from "/camera.svg";
import "./styles.css";
import {useNavigate} from "react-router";

export default function New() {
    const [company, setCompany] = useState("");
    const [techs, setTechs] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const navigate = useNavigate();

    const preview = useMemo(() => {
        return thumbnail ? URL.createObjectURL(thumbnail) : null;
    }, [thumbnail]);

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();

        const data = new FormData();
        const user_id = localStorage.getItem("user");

        if (thumbnail) {
            data.append("thumbnail", thumbnail);
        }

        data.append("company", company);
        data.append("techs", techs);
        data.append("price", price);

        await api.post("/spots", data, {
            headers: {user_id}
        });

        navigate("/dashboard");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label
                id="thumbnail"
                style={{backgroundImage: `url(${preview})`}}
                className={thumbnail ? "has-thumbnail" : ""}
            >
                <input
                    type="file"
                    onChange={event => event.target.files &&
                        setThumbnail(event.target.files[0])}
                />
                <img src={camera} alt="Select img"/>
            </label>

            <label htmlFor="company">EMPRESA *</label>
            <input
                id="company"
                placeholder="Sua empresa incrível"
                value={company}
                onChange={event => setCompany(event.target.value)}
            />
            <label htmlFor="techs">
                TECNOLOGIAS * <span>(separadas por vírgula)</span>
            </label>
            <input
                id="techs"
                placeholder="Quais tecnologias usam?"
                value={techs}
                onChange={event => setTechs(event.target.value)}
            />
            <label htmlFor="price">
                VALOR DA DIÁRIA <span>(em branco para GRATUITO)</span>
            </label>
            <input
                id="price"
                placeholder="Valor cobrado por dia"
                value={price}
                onChange={event => setPrice(event.target.value)}
            />

            <button type="submit" className="btn">
                Cadastrar
            </button>
        </form>
    );
}
