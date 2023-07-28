import {FaHockeyPuck} from "react-icons/fa";

function Pack(props) {
    return(
        <div className="pack" onClick={() => {props.purchasePack(props.price, props.size)}}>
            <h1>{props.name}</h1>
            <h3>{props.price} <FaHockeyPuck /></h3>
        </div>
    )
}

export default Pack;