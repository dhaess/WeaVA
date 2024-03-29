const Credits = () => {
    return (
        <div>
            <h1 style={{margin: "0px 0px 20px 0px"}}>Credits</h1>
            <div className={"modalInfo"}>
                <p>Application created by Dominique Hässig as Master thesis for the <a href="https://www.ifi.uzh.ch/en.html" target="_blank" title="ifi" rel="noreferrer">Department of Informatics for the University of Zurich</a></p>
                <p>Report data from <a href="https://www.meteoswiss.admin.ch/home.html?tab=overview" target="_blank" title="meteoSwiss" rel="noreferrer">MeteoSwiss</a></p>
                <p>Place information from <a href="https://www.swisstopo.admin.ch/de/geodata/amtliche-verzeichnisse/ortschaftenverzeichnis.html" target="_blank" title="swisstopo" rel="noreferrer">Federal Office of Topography</a></p>
                <p>Icons from <a href="https://www.flaticon.com/" target="_blank" title="flaticon" rel="noreferrer">Freepik - Flaticon</a></p>
            </div>
        </div>
    )
}

export default Credits;
