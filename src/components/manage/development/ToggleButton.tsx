import { faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './style.css'

export const ToggleButton = ({ isToggled, handleClick }) => {
    return (
        <button
            className='toggle-button'
            onClick={handleClick}>
            <FontAwesomeIcon icon={isToggled ? faLock : faUnlock} />
        </button>
    );
};
