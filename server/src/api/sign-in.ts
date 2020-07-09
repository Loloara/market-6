import express, { Request, Response } from 'express'
import { findUser } from '../modules/database/schema/user'
import { comparePassword } from '../modules/encryption'
import { validateBody } from '../middlewares/validate-body'
import { ErrMsg } from '../errors'
import { ApiResponse } from '@/types'

const router = express.Router()

router.post(
  '/api/sign-in',
  validateBody(['userId', 'password']),
  async (req: Request, res: Response) => {
    const signInResult: ApiResponse = {
      err: null,
    }
    const { userId, password } = req.body
    const [err, [foundUser, _]] = await findUser({ userId })
    if (!foundUser) {
      signInResult.err = {}
      signInResult.err.userId = ErrMsg.noneExistedUser
      res.send(signInResult)
      return
    }

    const isCorrectPassword = await comparePassword(
      password,
      foundUser.password
    )
    if (!isCorrectPassword) {
      signInResult.err = {}
      signInResult.err.password = ErrMsg.wrongPassword
      res.send(signInResult)
      return
    }

    req.session.user = foundUser
    res.send(signInResult)
  }
)

export { router as signInRouter }
