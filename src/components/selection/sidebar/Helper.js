// const colorList = [
//     '#e6194B', '#e86082',
//     '#3cb44b', '#89b78f',
//     '#ffe100', '#fff090',
//     '#4363d8', '#8193d1',
//     '#f58231', '#f1a672',
//     '#911eb4', '#9d5fb3',
//     '#42d4f4', '#b8dfec',
//     '#f032e6', '#eca7e5',
//     '#bfef45', '#ddeabf',
//     '#469990', '#a4c0bd',
//     '#9A6324', '#b2987b',
//     '#800000', '#a56565',
//     '#747400', '#a4a441',
//     '#000075', '#34347f']

import {Button} from "@mui/material";
import {useDispatch} from "react-redux";
import {changeClick} from "../../shared/features/SavingsSlice";

export default function Helper() {
    const dispatch = useDispatch()

    const handleClick = (event) => {
        dispatch(changeClick())
    }
    return (
        <div>
            <Button onClick={handleClick}>MapSelect</Button>
        </div>
    )
}
