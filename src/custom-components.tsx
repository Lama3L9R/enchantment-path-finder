import { Button, Typography, withStyles, Paper, List, Grid } from "@material-ui/core";

const MyGrid = withStyles({
    root: {
    }
})(Grid)

const MyButton = withStyles({
    root: {
        background: "#555",
        border: "0",
        boxShadow: "0px 1px 3px #0006"
    }
})(Button)

const MyText = withStyles({
    root: {
    }
})(Typography)

export const MyList = withStyles({
    root: {
    }
})(List)

const MyPaper = withStyles({
    root: {
        margin: 8,
        padding: 16,
        background: "#383838",
        minHeight: 480
    }
})(Paper)

export const WideGrid = withStyles({
    root: {
        flex: "2"
    }
})(MyGrid)
export const FillAvailableGrid = withStyles({
    root: {
        minHeight: "500px"
    }
})(MyGrid)

export const GreenButton = withStyles({
    root: {
        color: "#4caf50",
        width: "100%"
    }
})(MyButton)
export const RedButton = withStyles({
    root: {
        color: "#f44336",
        width: "100%"
    }
})(MyButton)
export const PrimaryButton = withStyles({
    root: {
        color: "#42a5f5",
        width: "100%",
        flex: "1"
    }
})(MyButton)

export const GrayText = withStyles({
    root: {
        color: "#666"
    }
})(MyText)
export const MoreGrayText = withStyles({
    root: {
        color: "#ffffff"
    }
})(MyText)

export const LeftPaper = withStyles({
    root: {
        minWidth: 300,
    }
})(MyPaper)
export const RightPaper = withStyles({
    root: {
        minWidth: 400,
    }
})(MyPaper)
