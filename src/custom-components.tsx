import { Button, Typography, withStyles } from "@material-ui/core";

export const GreenButton = withStyles({
    root: {
        color: "#4caf50",
        border: "1px solid #4caf50"
    }
})(Button)

export const RedButton = withStyles({
    root: {
        color: "#f44336",
        border: "1px solid #f44336"
    }
})(Button)

export const PrimaryButton = withStyles({
    root: {
        color: "#42a5f5",
        border: "1px solid #42a5f5"
    }
})(Button)

export const GrayText = withStyles({
    root: {
        color: "#494949"
    }
})(Typography)

export const MoreGrayText = withStyles({
    root: {
        color: "#ffffff"
    }
})(Typography)