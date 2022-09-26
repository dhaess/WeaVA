import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import PropTypes from "prop-types";
import {styled} from "@mui/material/styles";

const CancelButton = styled(Button)({
    border: "2px solid black",
    color: "black",
    "&:hover": {
        backgroundColor: "#eaeaea"
    }
})

const DeleteButton = styled(Button)({
    border: "2px solid black",
    backgroundColor: "#e84242",
    color: "white",
    "&:hover": {
        backgroundColor: "#d44c4c",
    }
})

const DeleteDialog = (props) => {
    const { onClose, name, open } = props

    const handleClose = (deleteConfirmed) => {
        onClose(deleteConfirmed)
    }

    return (
        <Dialog
            onClose={() => handleClose(false)}
            open={open}
        >
            <DialogContent>Do you want to delete "{name}"?</DialogContent>
            <DialogActions>
                <CancelButton onClick={() => handleClose(false)} autoFocus>Cancel</CancelButton>
                <DeleteButton onClick={() => handleClose(true)}>Delete</DeleteButton>
            </DialogActions>
        </Dialog>
    )
}

DeleteDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
};

export default DeleteDialog;
