import { UserSchema } from '~/server/models/user.schema'

export default defineEventHandler(async () => {
  try {
    return await UserSchema.find({})
  }
  catch (error) {
    return new Response(error as string, { status: 500 })
  }
})
