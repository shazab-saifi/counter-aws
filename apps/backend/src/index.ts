import cors from "cors"
import express, { type NextFunction, type Request, type Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { prisma } from "@repo/db"
import bcrypt from "bcrypt"

const app = express()
// app.use(cors({
//     origin: ["https://counter.shazab.site", "https://counter.shazab.site"]
// }))
app.use(express.json())

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload | { userId: string, iat: number };
        }
    }
}

function authMiddleWare(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization
    
    if (!token) {
        res.status(401).json({ msg: { error: "Unauthorized!" } })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        if (!decoded) {
            res.status(401).json({ msg: { error: "Unauthorized!" } })
            return
        }

        req.user = decoded as JwtPayload
        next();
    } catch (error) {
        res.status(500).json({ msg: { error: "Internal server error, please try again later!" } })
        console.log("Error in middleware", error)
    }
}

app.post("/signup", async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(401).json({ msg: { error: "username and password are needed for signup!" } })
        return
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } })

        if (existingUser) {
            res.status(409).json({ msg: { error: "User with this username already exits!" } })
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.user.create({data: { username, password: hashedPassword}})

        if (!user) throw new Error("Something went wrong :(")
    
        res.json({ msg: "Signed Up Successfully!" })
    } catch (error) {
        res.status(500).json({ msg: { error: "Internal server error, please try again later!" } })
        console.log("Error in signup endpoint", error)
    }
})

app.post("/signin", async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(401).json({ msg: { error: "username and password are needed for signin!" } })
        return
    }
    
    try {
        const existingUser = await prisma.user.findUnique({ where: { username } })

        if (!existingUser) {
            res.status(409).json({ msg: { error: "Invalid credentials" } })
            return
        }

        const isRightPassword = bcrypt.compareSync(password, existingUser.password);
        if (!isRightPassword) {
            res.status(409).json({ msg: { error: "Invalid credentials" } })
            return
        }

        const token = jwt.sign({
            userId: existingUser?.id
        }, process.env.JWT_SECRET!)

        res.json({ msg: "Signed In Successfully!", token })
    } catch (error) {
        res.status(500).json({ msg: { error: "Internal server error, please try again later!" } })
        console.log("Error in signin endpoint", error)
    }
})

app.get("/", authMiddleWare, async (req: Request, res: Response) => {
    const user = req.user

    try {
        const userData = await prisma.user.findUnique({ where: { id: user?.userId} })

        if (!userData) {
            res.status(403).json({ msg: { error: "User not found :(" } })
            return
        }

        res.json({
            userId: userData.id,
            username: userData.username
        })
    } catch (error) {
        res.status(500).json({ msg: { error: "Internal server error, please try again later!" } })
        console.log("Error in / endpoint", error)
    }
})

app.listen(4000, () => {
    console.log("Backend is running on port 4000!")
})
