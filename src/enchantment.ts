export class EnchantmentTypeEntry {
    public id: number
    public multiplierItem: number
    public multiplierBook: number
    public maxLevel: number
    public displayName: string
    public conflict: number[]

    constructor(id: number, displayName: string, multiplierItem: number, multiplierBook: number, maxLevel: number, ...conflict: number[]) {
        this.id = id
        this.multiplierItem = multiplierItem
        this.multiplierBook = multiplierBook
        this.displayName = displayName
        this.conflict = conflict
        this.maxLevel = maxLevel
    }

    calculateCost(level: number, isItem: boolean): number {
        return (isItem ? this.multiplierItem : this.multiplierBook) * level
    }

    isConflict(type: EnchantmentTypeEntry): boolean {
        return this.conflict.includes(type.id)
    }
}

export class Enchantment {
    public level: number
    public type: EnchantmentTypeEntry

    constructor(id: number, level: number) {
        this.type = enchantment[id]
        this.level = level
    }
}

export class EnchantmentDelta {
    public used: number
    public now: number
    public enchantment: Enchantment

    constructor(used: number, now: number, enchantment: Enchantment) {
        this.used = used;
        this.now = now;
        this.enchantment = enchantment;
    }

    levelDifference(): number {
        return this.now - this.used
    }
}

export class EnchantmentItem {
    public enchantments: Enchantment[]
    public byStep: EnchantmentStep | null
    public anvilUses: number
    public isItem: boolean

    constructor(byStep: EnchantmentStep | undefined, anvilUses: number, isItem: boolean, ...enchantments: Enchantment[]) {
        this.enchantments = enchantments
        this.anvilUses = anvilUses
        this.isItem = isItem
        if(byStep) {
            this.byStep = byStep
        } else {
            this.byStep = null
        }

        this.sortEnchantments()
    }

    sortEnchantments() {
        this.enchantments = sortEnchantments(this.enchantments)
    }

    calculateCost(sacrifice: EnchantmentItem): number {
        let cost = 0
        if(sacrifice.isItem && !this.isItem) {
            throw Error("Failed to calculate combined cost! Can't combined a enchantment book with a item!")
        }

        let item = sacrifice.isItem || this.isItem

        cost += getAnvilUsesCostByItem(this)
        cost += getAnvilUsesCostByItem(sacrifice)
        cost += conflictCount(this.enchantments, sacrifice.enchantments)

        findDelta(this.enchantments, sacrifice.enchantments).forEach((it) => {
            cost += it.enchantment.type.calculateCost(it.now, item)
        })

        return cost
    }
}

export class EnchantmentStep {
    public item: EnchantmentItem
    public sacrifice: EnchantmentItem
    public anvilCount: number

    constructor(item: EnchantmentItem, sacrifice: EnchantmentItem) {
        this.item = item;
        this.sacrifice = sacrifice;

        if(this.item.anvilUses > this.sacrifice.anvilUses) {
            this.anvilCount = this.item.anvilUses + 1
        } else {
            this.anvilCount = this.sacrifice.anvilUses + 1
        }
    }

    result(): EnchantmentItem {
        return new EnchantmentItem(this, this.anvilCount, this.item.isItem, ...mergeEnchantment(this.item.enchantments, this.sacrifice.enchantments))
    }
}

export function getAnvilUsesCostByItem(item: EnchantmentItem): number {
    return 2 ** item.anvilUses - 1
}

export function getAnvilUsesCostByTimes(times: number): number {
    return 2 ** times - 1
}

export function getAnvilUsesByCost(cost: number): number {
    return Math.log2(cost + 1)
}

export function mergeEnchantment(item: Enchantment[], sacrifice: Enchantment[]): Enchantment[] {
    let result: Enchantment[] = []

    let i = 0
    for(; i < item.length; i++) {
        if(i >= sacrifice.length) {
            if(sacrifice.some((it) => { return it.type.isConflict(item[i].type) })) {
                continue;
            }
            result.push(item[i])
            continue;
        }
        let itemEnchantment = item[i]
        let sacrificeEnchantment = sacrifice[i]
        if(itemEnchantment.type === sacrificeEnchantment.type) {
            let newLevel: number
            if(itemEnchantment.level === sacrificeEnchantment.level) {
                newLevel = ++itemEnchantment.level
            } else {
                if(itemEnchantment.level > sacrificeEnchantment.level) {
                    newLevel = itemEnchantment.level
                } else {
                    newLevel = sacrificeEnchantment.level
                }
            }

            if(newLevel > itemEnchantment.type.maxLevel) {
                newLevel = itemEnchantment.type.maxLevel
            }
            result.push(new Enchantment(itemEnchantment.type.id, newLevel))
        } else {
            if(!sacrifice.some((it) => { return it.type.isConflict(item[i].type) })) {
                result.push(sacrificeEnchantment)
            }
            result.push(itemEnchantment)
        }
    }

    if(i < sacrifice.length - 1) {
        sacrifice.filter((it) => { return !result.some((s) => { return s.type.isConflict(it.type) }) }).forEach((it) => {
            result.push(it)
        })
    }

    return result
}

export function conflictCount(item: Enchantment[], sacrifice: Enchantment[]): number {
    return item.filter((it) => { return sacrifice.some((sac) => { return sac.type.isConflict(it.type) })}).length
}

export function findDelta(item: Enchantment[], sacrifice: Enchantment[]): EnchantmentDelta[] {
    let result: EnchantmentDelta[] = []

    let i = 0
    for(; i < item.length; i++) {
        if(i >= sacrifice.length) {
            break;
        }
        let itemEnchantment = item[i]
        let sacrificeEnchantment = sacrifice[i]
        if(itemEnchantment.type === sacrificeEnchantment.type) {
            let newLevel: number
            if(itemEnchantment.level === sacrificeEnchantment.level) {
                newLevel = ++itemEnchantment.level
            } else {
                if(itemEnchantment.level > sacrificeEnchantment.level) {
                    newLevel = itemEnchantment.level
                } else {
                    newLevel = sacrificeEnchantment.level
                }
            }

            if(newLevel > itemEnchantment.type.maxLevel) {
                newLevel = itemEnchantment.type.maxLevel
            }
            result.push(new EnchantmentDelta(itemEnchantment.level, newLevel, itemEnchantment))
        } else {
            result.push(new EnchantmentDelta(itemEnchantment.level, itemEnchantment.level, itemEnchantment))
        }
    }

    if(i < sacrifice.length - 1) {
        sacrifice.filter((it) => { return !result.some((s) => { return s.enchantment.type.isConflict(it.type) }) }).forEach((it) => {
            result.push(new EnchantmentDelta(it.level, it.level, it))
        })
    }

    return result
}

export function sortEnchantments(arr: Enchantment[]): Enchantment[] {
    let len = arr.length
    if(len < 2) {
        return arr
    }
    let middle = Math.floor(len / 2)
    let left = arr.slice(0, middle)
    let right = arr.slice(middle)
    return _merge(sortEnchantments(left), sortEnchantments(right))
}

function _merge(left: Enchantment[], right: Enchantment[]): Enchantment[] {
    let result: Enchantment[] = []

    while (left.length && right.length) {
        if (right[0].type.id > left[0].type.id) {
            result.push(left.shift() as Enchantment)
        } else {
            result.push(right.shift() as Enchantment)
        }
    }

    while (left.length) {
        result.push(left.shift() as Enchantment)
    }

    while (right.length) {
        result.push(right.shift() as Enchantment)
    }

    return result
}

export function sortEnchantmentItemByAnvilUses(arr: EnchantmentItem[]): EnchantmentItem[] {
    let len = arr.length
    if(len < 2) {
        return arr
    }
    let middle = Math.floor(len / 2)
    let left = arr.slice(0, middle)
    let right = arr.slice(middle)
    return _merge0(sortEnchantmentItemByAnvilUses(left), sortEnchantmentItemByAnvilUses(right))
}

function _merge0(left: EnchantmentItem[], right: EnchantmentItem[]): EnchantmentItem[] {
    let result: EnchantmentItem[] = []

    while (left.length && right.length) {
        if (right[0].anvilUses > left[0].anvilUses) {
            result.push(left.shift() as EnchantmentItem)
        } else {
            result.push(right.shift() as EnchantmentItem)
        }
    }

    while (left.length) {
        result.push(left.shift() as EnchantmentItem)
    }

    while (right.length) {
        result.push(right.shift() as EnchantmentItem)
    }

    return result
}

export function findBestEnchantPath(materials: EnchantmentItem[], expect: EnchantmentItem | undefined): EnchantmentStep[] {
    let totalEnchantments: EnchantmentTypeEntry[] = []
    materials.forEach((it) => {
        totalEnchantments.push(...it.enchantments.map((e) => { return e.type }))
    })

    if(expect) {
        if(totalEnchantments.length < expect.enchantments.length) {
            throw Error("Impossible to reach expect enchantment!")
        }
    }

    if(materials.length <= 2) {
        throw Error("There is only one way to do this. Just stop wasting your time and your pc's power pls!")
    }

    return search(materials)
}

function search(materials: EnchantmentItem[]): EnchantmentStep[] {
    let combinedPair: EnchantmentStep[] = []
    let next: EnchantmentItem[] = []

    for(let i = 0; i < materials.length; i++) {
        if(i >= materials.length) {
            break
        }

        let material = materials[i]
        let sameUses = materials.filter((e) => { return e.anvilUses === material.anvilUses && e !== material })
        if(sameUses.length >= 1) {
            let pick = sameUses[0]
            materials = materials.filter((i) => { return i !== pick && i !== material })
            combinedPair.push(new EnchantmentStep(material, pick))
        }
    }

    if(materials.length <= 1) {
        if(materials.length === 1) {
            next.push(materials[0])
        }
    } else {
        let sorted = sortEnchantmentItemByAnvilUses(materials)
        for(let i = 0; i < sorted.length; i++) {
            if(i + 1 >= sorted.length) {
                next.push(sorted[i])
            } else {
                combinedPair.push(new EnchantmentStep(sorted[i], sorted[++i]))
            }
        }
    }

    combinedPair.forEach((it) => { next.push(it.result()) })

    if(next.length > 1) {
        combinedPair.push(...search(next))
    }
    return combinedPair
}

export const enchantment = [
    new EnchantmentTypeEntry(0, "保护", 1, 1, 4,4, 3, 1),
    new EnchantmentTypeEntry(1, "火焰保护", 2, 1, 4,4, 3, 0),
    new EnchantmentTypeEntry(2, "摔落保护", 2, 1, 4),
    new EnchantmentTypeEntry(3, "爆炸保护", 4, 2, 4, 4, 1, 0),
    new EnchantmentTypeEntry(4, "弹射物保护", 2, 1, 4,3, 1, 0),
    new EnchantmentTypeEntry(5, "水下呼吸", 4, 2, 3),
    new EnchantmentTypeEntry(6, "水下速掘", 4, 2, 1),
    new EnchantmentTypeEntry(7, "荆棘", 8, 4, 3),
    new EnchantmentTypeEntry(8, "深海探索者", 4, 2, 3, 25),
    new EnchantmentTypeEntry(9, "锋利", 1, 1, 5, 10, 11),
    new EnchantmentTypeEntry(10, "亡灵杀手", 2, 1, 9, 11),
    new EnchantmentTypeEntry(11, "节肢杀手", 2, 1, 9, 10),
    new EnchantmentTypeEntry(12, "击退", 2, 1, 2),
    new EnchantmentTypeEntry(13, "火焰附加", 4, 2, 2),
    new EnchantmentTypeEntry(14, "抢夺", 4, 2, 3),
    new EnchantmentTypeEntry(15, "效率", 1, 1, 5),
    new EnchantmentTypeEntry(16, "精准采集", 8, 4, 1),
    new EnchantmentTypeEntry(17, "耐久", 2, 1, 3),
    new EnchantmentTypeEntry(18, "时运", 4, 2, 3),
    new EnchantmentTypeEntry(19, "力量", 1, 1, 5),
    new EnchantmentTypeEntry(20, "冲击", 4, 2, 2),
    new EnchantmentTypeEntry(21, "火失", 4, 2, 1),
    new EnchantmentTypeEntry(22, "无限", 8, 4, 1),
    new EnchantmentTypeEntry(23, "海之眷顾", 4, 2, 3),
    new EnchantmentTypeEntry(24, "饵钓", 4, 2, 3),
    new EnchantmentTypeEntry(25, "冰霜行者", 4, 2, 2, 8),
    new EnchantmentTypeEntry(26, "经验修补", 4, 2, 1),
    new EnchantmentTypeEntry(27, "绑定诅咒", 8, 4, 1),
    new EnchantmentTypeEntry(28, "消失诅咒", 8, 4, 1),
    new EnchantmentTypeEntry(29, "穿刺", 4, 2, 5),
    new EnchantmentTypeEntry(30, "激流", 4, 2, 3, 31, 32),
    new EnchantmentTypeEntry(31, "忠诚", 1, 1, 3, 30),
    new EnchantmentTypeEntry(32, "引雷", 8, 4, 1, 30),
    new EnchantmentTypeEntry(33, "多重射击", 4, 2, 1, 34),
    new EnchantmentTypeEntry(34, "穿透", 1, 1, 4, 33),
    new EnchantmentTypeEntry(35, "快速装填", 2, 3, 1),
    new EnchantmentTypeEntry(36, "灵魂疾行", 8, 3, 4),
    new EnchantmentTypeEntry(37, "横扫之刃", 4, 3, 2),
]