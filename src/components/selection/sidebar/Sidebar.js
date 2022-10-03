import $ from 'jquery';
import "../../../static/style/sidebar.css"
import ToggleButtonsMultiple from "./CategorySelector";
import TimePicker from "./TimePicker";
import AreaSelector from "./AreaSelector";
import NameSelector from "./NameSelector";
import ColorSelector from "./ColorSelector";
import EndButtons from "./EndButtons";
import ImageSelect from "./ImageSelect";
import Settings from "../../shared/Settings";

const Sidebar = () => {
    const navStatus = () => {
        if (document.getElementById("hamburger").classList.contains('hamburger-active')) {
            navClose();
        } else {
            navOpen();
        }
    }

    const navClose = () => {
        $('#SidebarContainer').css('opacity', '0');
        setTimeout(function () {
            document.getElementById("hamburger").classList.remove('hamburger-active');
            $('#SidebarAll').css('width', '63px');
        }, 300);
    }

    const navOpen = () => {
        document.getElementById("hamburger").classList.add('hamburger-active');
        $('#SidebarAll').css('width', '320px');
        setTimeout(function () {
            $('#SidebarContainer').css('opacity', '1');
        }, 500)
    }

    return (
        <div id="SidebarAll">
            <aside id="SidebarContainer">
                <div id="TopContainer">
                    <Settings/>
                </div>
                <div className="Sidebar h-100 scroll-shadows">
                    <div id="filter" className="d-flex flex-column justify-content-between h-100" action="src/components/selection/Sidebar/Sidebar">
                        <h2>Filter options</h2>
                        <ToggleButtonsMultiple/>
                        <TimePicker/>
                        <ImageSelect/>
                        <AreaSelector/>
                        <h2>Styling Options</h2>
                        <NameSelector/>
                        <ColorSelector/>
                    </div>
                </div>
                <EndButtons/>
            </aside>
            <div id="hamburger" className="hamburger-icon-container hamburger-active position-absolute" onClick={navStatus}>
                <span className="hamburger-icon"></span>
            </div>
        </div>
    );
};

export default Sidebar;

