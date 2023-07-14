import EditorJS from '@editorjs/editorjs'

import { isAuthor } from '../../../utils/access-control'
import { HC_TABLE } from '../../constants'
import { getDb } from '../../helpers/db'
import { secureQuery, toSqlDate } from '../../helpers/sql'

export default defineEventHandler(async event => {
  if (!isAuthor(event)) {
    return
  }

  const db = await getDb()

  const updateContent = (contentId: number, content: EditorJS.OutputData) =>
    secureQuery(() =>
      db(HC_TABLE.CONTENTS)
        .update({
          blocks: JSON.stringify(content.blocks),
          last_update: toSqlDate(content.time || Date.now()),
          editor_version: content.version,
        })
        .where({ id: contentId }),
    )

  const contentId = event.context.params?.id

  if (!contentId) {
    return
  }

  const body = await readBody(event)

  if (!body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property content is missing',
    })
  }

  return updateContent(parseInt(contentId), body.content)
})
