import React, {Dispatch, SetStateAction, useRef} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {
    Box,
    Button,
    createTheme,
    CssBaseline, Divider,
    FormControl, FormControlLabel,
    Grid, Grow, IconButton, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText,
    MenuItem,
    Select, Switch, TextField,
    ThemeProvider, Typography, withStyles
} from "@material-ui/core";
import {Enchantment, enchantment, EnchantmentItem} from "./enchantment";

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
            default: "#303030",
            paper: "#424242"
        },
        success: {
            main: "#4caf50"
        }
    }
})

const GreenButton = withStyles({
    root: {
        color: "#4caf50",
        border: "1px solid #4caf50"
    }
})(Button)

const RedButton = withStyles({
    root: {
        color: "#f44336",
        border: "1px solid #f44336"
    }
})(Button)

const GrayText = withStyles({
    root: {
        color: "#494949"
    }
})(Typography)

function InputRoot() {
    const [currentItemEnchantments, setCurrentItemEnchantments] = React.useState<EnchantmentItem[]>([])

    return <Box>
        <Grid container direction="column">

            <Grid item>
                <InputArea items={currentItemEnchantments} setItems={setCurrentItemEnchantments} />
            </Grid>

            <Grid item>
                <InputList items={currentItemEnchantments} setItems={setCurrentItemEnchantments} />
            </Grid>
        </Grid>
    </Box>
}

function InputArea(child: any, items: EnchantmentItem[], setItems: Dispatch<SetStateAction<EnchantmentItem[]>>) {
    const [selectedEnchantment, setSelectedEnchantment] = React.useState(0)
    const [isItem, setIsItem] = React.useState(false)
    //const [itemLabel, setItemLabel] = React.useState("附魔书")
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

    console.log(items)

    return <Grid container direction="column" wrap="nowrap" spacing={2}>
        <Grid item container direction="row" wrap="nowrap" justifyContent="space-between" alignItems="center" spacing={3}>
            <Grid item>
                <FormControl >
                    <InputLabel id="input-area-select-label" color="primary"> 附魔 </InputLabel>
                    <Select labelId="input-area-select-label" defaultValue={ 0 } value={ selectedEnchantment } onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                        setSelectedEnchantment(e.target.value as number)
                        if(inputRef.current) {
                            inputRef.current.value = "1"
                        }
                    }}>
                        {
                            enchantment.map((it) => {
                                return <MenuItem value={it.id}>{ it.displayName }</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>

                <TextField id="input-area-level" label="等级" type="number" defaultValue={ 1 } InputProps={createMinMaxPair(selectedEnchantment)} style={{ paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1) }} color="secondary" onChange={(event) => {
                    if(+event.target.value > enchantment[selectedEnchantment].maxLevel) {
                        event.target.value = `${enchantment[selectedEnchantment].maxLevel}`
                    }

                    if(+event.target.value < 1) {
                        event.target.value = "1"
                    }
                }} />
            </Grid>

            <Grid item>
                <Button color="primary" variant="outlined" onClick={(e) => {
                    if(inputRef.current) {
                        setCurrentEnchantments([new Enchantment(selectedEnchantment, Number(inputRef.current.value)), ...currentEnchantments])
                    }
                }}> 添加附魔 </Button>
            </Grid>
        </Grid>
        <Divider />
        <List>
            { (() => {
                if(currentEnchantments.length === 0) {
                    return <Grid container justifyContent="center" alignItems="center">
                        <Grid item> <GrayText> 这个物品没有任何附魔 </GrayText> </Grid>
                    </Grid>
                } else {
                    return currentEnchantments.map((it) => {
                        return <ListItem>
                            <ListItemText primary={`${ it.type.displayName } ${ it.level }`} />
                            <ListItemSecondaryAction>
                                <RedButton onClick={(e) => {
                                    setCurrentEnchantments(currentEnchantments.filter((e) => { return e !== it }))
                                }}> 删除这个附魔 </RedButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    })
                }
            })() }
        </List>
        <Divider />

        <Grid item container justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item>
                <GreenButton variant="outlined" onClick={(e) => {
                    setItems(items.concat([new EnchantmentItem(undefined, 0, true, ...currentEnchantments)]))
                    setCurrentEnchantments([])
                }}> 添加为物品 </GreenButton>
            </Grid>

            <Grid item>
                <GreenButton variant="outlined" onClick={(e) => {
                    setItems(items.concat([new EnchantmentItem(undefined, 0, false, ...currentEnchantments)]))
                    setCurrentEnchantments([])
                }}> 添加为附魔书 </GreenButton>
            </Grid>
        </Grid>
        <RedButton variant="outlined" onClick={(e) => {
            setCurrentEnchantments([])
        }}> 清空全部附魔 </RedButton>

    </Grid>
}

function InputList(child: any, items: EnchantmentItem[], setItems: Dispatch<SetStateAction<EnchantmentItem[]>>) {
    return <div>

    </div>
}

function OutputRoot() {
    return <div>

    </div>
}

function Foot() {
    return <div>

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