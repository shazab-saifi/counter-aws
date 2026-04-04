import express, { type NextFunction, type Request, type Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { prisma } from "@repo/db"
import bcrypt from "bcrypt"

const app = express()
app.use(express.json())

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload | { username: string };
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

        req.user = JSON.parse(decoded as string)
        next();
    } catch (error) {
        res.status(500).json({ msg: { error: "Internal server error, please try again later!" } })
        console.log("Error in middleware", error)
        return
    }
}

app.post("/signup", async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(401).json({ msg: { error: "username and password are needed for signup!" } })
        return
    }

    try {
        const existingUser = await prisma.user.findFirst({ where: { username } })

        if (existingUser) {
            res.status(409).json({ msg: { error: "User with this username already exits!" } })
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.user.create({data: { username, password: hashedPassword}})

        if (!user) throw new Error("Something went wrong :(")
        
        const token = jwt.sign({
            userid: user.id
        }, process.env.JWT_SECRET!)

        res.json({ msg: "User created successfully!", token })
    } catch (error) {
        res.status(500).json({ msg: { error: "Internal server error, please try again later!" } })
        console.log("Error in signup endpoint", error)
        return
    }
})

app.listen(4000, () => {
    console.log("Backend is running on port 4000!")
})