import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {
    Box, Button, createTheme, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider,
    FormControl, Grid, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, ThemeProvider
} from "@material-ui/core";
import { Enchantment, enchantment, EnchantmentItem, findBestEnchantPath } from "./enchantment";
import {GrayText, GreenButton, MoreGrayText, PrimaryButton, RedButton} from "./custom-components";

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
        <Grid container direction="column" spacing={3}>
            <Grid item>
                <Grid container direction="column" wrap="nowrap" spacing={2}>
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
                        {
                            (() => {
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
                            })()
                        }
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
            </Grid>

            <Grid item container direction="column" wrap="nowrap" spacing={2}>
                <Grid item>
                    <Divider />
                    <List>
                        {
                            (() => {
                                if(items.length === 0) {
                                    return <Grid container justifyContent="center" alignItems="center">
                                        <Grid item> <GrayText> 没有任何物品 </GrayText> </Grid>
                                    </Grid>
                                } else {
                                    return items.map((it, index) => {
                                        return <ListItem>
                                            <ListItemText primary={`${it.isItem ? "物品" : "附魔书"} #${ index }`} onClick={(e) => {
                                                setEnchantmentViewSelected(it)
                                                setEnchantmentViewOpen(true)
                                            }}/>
                                            <ListItemSecondaryAction>
                                                <RedButton onClick={(e) => {
                                                    setItems(items.filter((e) => { return e !== it }))
                                                }}> 删除这个物品 </RedButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    })
                                }
                            })()
                        }
                    </List>
                    <Divider />
                </Grid>
                <PrimaryButton onClick={(e) => {
                    try {
                        console.log(findBestEnchantPath(items, undefined))
                    } catch (e) {
                        alert("哥，别浪费你电脑算力了，就一种方案。")
                    }
                    setLazy(true)
                }}> 查找最优方案 </PrimaryButton>
                <Dialog open={enchantmentViewOpen}>
                    <DialogTitle>附魔</DialogTitle>
                    <DialogContent>
                        {
                            (() => {
                                if(enchantmentViewSelected?.enchantments.length === 0) {
                                    return <DialogContentText> <MoreGrayText> 没有任何附魔 </MoreGrayText> </DialogContentText>
                                } else {
                                    return enchantmentViewSelected?.enchantments.map((it) => {
                                        return <DialogContentText> { `${it.type.displayName} ${it.level}` } </DialogContentText>
                                    })
                                }
                            })()
                        }
                    </DialogContent>

                    <DialogActions>
                        <RedButton onClick={(e) => {
                            setEnchantmentViewOpen(false)
                        }}>
                            关闭
                        </RedButton>
                    </DialogActions>
                </Dialog>

                <Dialog open={lazy}>
                    <DialogTitle> 教程: 如何查看结果 </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <code>
                                首先，拿出你的键盘。之后在你的键盘上找到一个叫做 'F12' 的按键并按下去，按下去的同时确保你的浏览器是在焦点的，如果不清楚是否在焦点，请点击网页窗口获取焦点。
                                接下来会打开一个叫做 'Developers Tools' 的侧栏。在这个侧栏中找到 'Console' 并点下去。最后一条输出既是结果。
                            </code>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <GreenButton onClick={(e) => { setLazy(false) }}> 学会了 </GreenButton>
                        <RedButton onClick={(e) => { alert("脑残滚") }}> 我还不太明白... </RedButton>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    </Box>
}

function OutputRoot() {
    return <div>
        { /* 咕咕咕 */ }
    </div>
}

function Foot() {
    return <div>
        { /* 咕咕咕 */ }
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