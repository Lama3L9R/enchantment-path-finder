import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {
    Box, Button, createTheme, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider,
    FormControl, Grid, InputLabel, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, ThemeProvider
} from "@material-ui/core";
import { Enchantment, enchantment, EnchantmentItem, findBestEnchantPath } from "./enchantment";
import {GrayText, GreenButton, MoreGrayText, PrimaryButton, RedButton, LeftPaper, RightPaper, MyList, WideGrid, FillAvailableGrid} from "./custom-components";

const theme = createTheme({
    palette: {
        type: "dark",
        primary: {
            main: "#42a5f5",
        },
        secondary: {
            main: "#00bcd4",
        },
        background: {
            default: "#323232"
        },
        success: {
            main: "#4caf50"
        }
    }
})

function InputRoot() {
    const [items, setItems] = React.useState<EnchantmentItem[]>([])
    const [selectedEnchantment, setSelectedEnchantment] = React.useState(0)
    const [currentEnchantments, setCurrentEnchantments] = React.useState<Enchantment[]>([])
    const createMinMaxPair = (id: number) => {
        let emt = enchantment[id]
        return {
            inputProps: {
                min: 1,
                max: emt.maxLevel,
                ref: inputRef
            }
        }
    }
    const inputRef = React.useRef<HTMLInputElement>(null)

    const [enchantmentViewSelected, setEnchantmentViewSelected] = React.useState<EnchantmentItem | null>(null)
    const [enchantmentViewOpen, setEnchantmentViewOpen] = React.useState(false)

    const [lazy, setLazy] = React.useState(false)

    return <Box>
        <Grid container direction="row" spacing={2} justifyContent="center" alignItems="center">
            <LeftPaper><Grid item><FillAvailableGrid container direction="column" spacing={3}>
                <WideGrid item>
                    <MyList>
                        {
                            (() => {
                                if (items.length === 0) {
                                    return <Grid container justifyContent="center" alignItems="center">
                                        <Grid item> <GrayText> ?????????????????? </GrayText> </Grid>
                                    </Grid>
                                } else {
                                    return items.map((it) => {
                                        return <ListItem>
                                            <ListItemText primary={`${it.isItem ? "??????" : "?????????"} #${it.index}`} onClick={(e) => {
                                                setEnchantmentViewSelected(it)
                                                setEnchantmentViewOpen(true)
                                            }} />
                                            <ListItemSecondaryAction>
                                                <RedButton onClick={(e) => {
                                                    setItems(items.filter((e) => { return e !== it }))
                                                }}> ?????????????????? </RedButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    })
                                }
                            })()
                        }
                    </MyList>
                    <Dialog open={enchantmentViewOpen}>
                        <DialogTitle>??????</DialogTitle>
                        <DialogContent>
                            {
                                (() => {
                                    if (enchantmentViewSelected?.enchantments.length === 0) {
                                        return <DialogContentText> <MoreGrayText> ?????????????????? </MoreGrayText> </DialogContentText>
                                    } else {
                                        return enchantmentViewSelected?.enchantments.map((it) => {
                                            return <DialogContentText> {`${it.type.displayName} ${it.level}`} </DialogContentText>
                                        })
                                    }
                                })()
                            }
                        </DialogContent>

                        <DialogActions>
                            <RedButton onClick={(e) => {
                                setEnchantmentViewOpen(false)
                            }}>??????</RedButton>
                        </DialogActions>
                    </Dialog>
                </WideGrid>
                <Grid item>
                    <PrimaryButton
                    
                    onClick={(e) => {
                        try {
                            var message: string = "????????????:"
                            const steps = findBestEnchantPath(items, undefined)
                            steps.forEach((step) => {
                                message = message + " " + step.item.index + "+" + step.sacrifice.index + "->" + step.resultItem.index + " "
                            })
                            alert(message + "(????????????)")
                        } catch (e) {
                            alert("??????????????????")
                        }
                        setLazy(true)
                    }}> ?????????????????? </PrimaryButton>
                </Grid>
            </FillAvailableGrid></Grid></LeftPaper>

            <RightPaper><Grid item><FillAvailableGrid container direction="column" spacing={3}>
                {/* <Grid item container direction="column" wrap="nowrap" spacing={2}> */}
                <Grid item container direction="row" wrap="nowrap" justifyContent="space-between" alignItems="center" spacing={2}>
                    <WideGrid item container direction="row" spacing={1}>
                        <WideGrid item><FormControl fullWidth>
                            <InputLabel id="input-area-select-label" color="primary"> ?????? </InputLabel>
                            <Select labelId="input-area-select-label" defaultValue={0} value={selectedEnchantment} onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                                setSelectedEnchantment(e.target.value as number)
                                if (inputRef.current) {
                                    inputRef.current.value = "1"
                                }
                            }}>
                                {
                                    enchantment.map((it) => {
                                        return <MenuItem value={it.id}>{it.displayName}</MenuItem>
                                    })
                                }
                            </Select>
                        </FormControl></WideGrid>

                        <Grid item><TextField id="input-area-level" label="??????" type="number" defaultValue={1} InputProps={createMinMaxPair(selectedEnchantment)} style={{ paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1) }} color="secondary" onChange={(event) => {
                            if (+event.target.value > enchantment[selectedEnchantment].maxLevel) {
                                event.target.value = `${enchantment[selectedEnchantment].maxLevel}`
                            }

                            if (+event.target.value < 1) {
                                event.target.value = "1"
                            }
                        }} /></Grid>
                    </WideGrid>

                    <Grid item>
                        <Button color="primary" variant="outlined" onClick={(e) => {
                            if (inputRef.current) {
                                setCurrentEnchantments([new Enchantment(selectedEnchantment, Number(inputRef.current.value)), ...currentEnchantments])
                            }
                        }}> ???????????? </Button>
                    </Grid>
                </Grid>
                <Divider />
                <WideGrid item><MyList>
                    {
                        (() => {
                            if (currentEnchantments.length === 0) {
                                return <Grid container justifyContent="center" alignItems="center">
                                    <Grid item> <GrayText> ?????????????????????????????? </GrayText> </Grid>
                                </Grid>
                            } else {
                                return currentEnchantments.map((it) => {
                                    return <ListItem>
                                        <ListItemText primary={`${it.type.displayName} ${it.level}`} />
                                        <ListItemSecondaryAction>
                                            <RedButton onClick={(e) => {
                                                setCurrentEnchantments(currentEnchantments.filter((e) => { return e !== it }))
                                            }}> ?????????????????? </RedButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                })
                            }
                        })()
                    }
                </MyList></WideGrid>

                <Grid item><RedButton variant="outlined" onClick={(e) => {
                    setCurrentEnchantments([])
                }}> ?????????????????? </RedButton></Grid>
                <Divider />

                <Grid item container direction="row" alignItems="center" spacing={1}>
                    <WideGrid item>
                        <GreenButton variant="outlined" onClick={(e) => {
                            setItems(items.concat([new EnchantmentItem(undefined, 0, true, false, ...currentEnchantments)]))
                            setCurrentEnchantments([])
                        }}> ??????????????? </GreenButton>
                    </WideGrid>

                    <WideGrid item>
                        <GreenButton variant="outlined" onClick={(e) => {
                            setItems(items.concat([new EnchantmentItem(undefined, 0, false, false, ...currentEnchantments)]))
                            setCurrentEnchantments([])
                        }}> ?????????????????? </GreenButton>
                    </WideGrid>
                </Grid>
                {/* </Grid> */}
            </FillAvailableGrid></Grid></RightPaper>
        </Grid>
    </Box>
}

function OutputRoot() {
    return <div>
        { /* ????????? */ }
    </div>
}

function Foot() {
    return <div>
        { /* ????????? */ }
    </div>
}

function Main() {
    return <ThemeProvider theme={ theme }>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Grid container direction="column" justifyContent="center" alignItems="center" color="background" style={{ minHeight: '100vh' }}>
                <Grid item>
                    <InputRoot />
                </Grid>

                <Grid item>
                    <OutputRoot />
                </Grid>

                <Grid item>
                    <Foot />
                </Grid>
            </Grid>
        </Box>
    </ThemeProvider>
}

ReactDOM.render(<Main />, document.getElementById('root'))