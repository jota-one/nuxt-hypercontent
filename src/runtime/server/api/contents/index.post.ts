import { isAuthor } from '../../../utils/access-control'
import { HC_TABLE } from '../../constants'
import { getDb } from '../../helpers/db'
import { toSqlDate } from '../../helpers/sql'

export default defineEventHandler(async event => {
  const db = await getDb()

  const insertContent = (
    pageId: number,
    langId: number,
    content: EditorJS.OutputData,
  ) =>
    db.transaction(async trx => {
      const inserted = await trx(HC_TABLE.CONTENTS).insert({
        blocks: JSON.stringify(content.blocks),
        last_update: toSqlDate(content.time || Date.now()),
        editor_version: content.version,
        state: 'published',
      })

      await trx(HC_TABLE.PAGES_LANG)
        .where({ page_id: pageId, lang_id: langId })
        .update({ content_id: inserted[0] })
    })

  if (!isAuthor(event)) {
    return
  }

  const body = await readBody(event)

  if (!body.page_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property page_id is missing',
    })
  }

  if (!body.lang_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property lang_id is missing',
    })
  }

  if (!body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property content is missing',
    })
  }

  return insertContent(body.page_id, body.lang_id, body.content)
})
