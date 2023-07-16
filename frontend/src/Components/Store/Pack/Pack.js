import {FaHockeyPuck} from "react-icons/fa";

function Pack(props) {
    return(
        <div className="pack" onClick={() => {props.purchasePack(500, 5)}}>
            <h1>Standard Pack</h1>
            <h3>500 <FaHockeyPuck /></h3>
        </div>
    )
}

export default Pack;