import { isAuthor } from '../../../utils/access-control'
import { HC_SLUG_RESOLVE_FIELD, HC_TABLE } from '../../constants'
import { getDb } from '../../helpers/db'
import { secureQuery, toInt } from '../../helpers/sql'

export default defineEventHandler(async event => {
  const db = await getDb()

  const getContent = async (
    pageId: number,
    langId: number,
    editMode: boolean,
    slugKey?: string,
    slugValue?: string,
  ) => {
    const contents = await secureQuery(() =>
      db(`${HC_TABLE.PAGES_LANG} as pl`)
        .join(`${HC_TABLE.CONTENTS} as c`, 'c.id', 'pl.content_id')
        .where({
          'pl.page_id': pageId,
          'pl.lang_id': langId,
          ...(!isAuthor(event, true) ? { 'c.state': 'published' } : {}),
        })
        .select('c.*'),
    )

    if (slugKey && slugValue) {
      const resolveExprRecords = await secureQuery(() =>
        db(`${HC_TABLE.PAGES_LANG} as pl`)
          .join(`${HC_TABLE.PAGES} as p`, 'pl.page_id', 'p.id')
          .where({ page_id: pageId, lang_id: langId })
          .select(HC_SLUG_RESOLVE_FIELD),
      )

      if (resolveExprRecords.length !== 1) {
        return { contents }
      }

      let result = []

      try {
        const def = JSON.parse(resolveExprRecords[0][HC_SLUG_RESOLVE_FIELD])
        const q = db(`${def.table} as ${def.alias}`)

        if (def.joins) {
          for (const join of def.joins) {
            q.join(`${join.table} as ${join.alias}`, function () {
              for (let i = 0; i < join.on.length; i++) {
                const on = join.on[i]
                const onLeft = `${on.left.table}.${on.left.column}`
                const onRight = `${on.right.table}.${on.right.column}`

                if (i === 0) {
                  this.on(onLeft, onRight)
                } else {
                  this.andOn(onLeft, onRight)
                }
              }
            })
          }
        }

        q.where(
          def.where.reduce((clausesObj: any, clause: any) => {
            clausesObj[clause.column] = clause.value.includes('RESOLVED_SLUG')
              ? slugValue
              : clause.value
            return clausesObj
          }, {}),
        )

        result = await q.select(def.columns)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        throw createError('Resolving dynamic page failed')
      }

      if (!result.length) {
        // Returning nothing sends a 404 status
        return
      }

      const entityAlias = `:${slugKey.substring(0, slugKey.indexOf('.'))}`
      const resolvedEntity = result[0]
      const re = new RegExp(`${entityAlias}.([\\w-]+)`, 'dgim')

      const resolvePlaceholders = (input = '', resolvedEntity: any): string => {
        const replacements = []
        let match: RegExpExecArray | null

        while ((match = re.exec(input)) !== null) {
          replacements.push({ what: match[0], with: resolvedEntity[match[1]] })
        }

        const replaced = replacements.reduce((replaced, replacement) => {
          if (replacement.with) {
            replaced = replaced.replaceAll(replacement.what, replacement.with)
          }
          return replaced
        }, input)

        return replaced.replaceAll(
          `"${entityAlias}"`,
          JSON.stringify(resolvedEntity),
        )
      }

      return {
        contents: contents.map(content =>
          content.state === 'published' && !editMode
            ? {
                ...content,
                label: resolvePlaceholders(content.label, resolvedEntity),
                blocks: resolvePlaceholders(content.blocks, resolvedEntity),
              }
            : content,
        ),
        resolved: resolvedEntity,
      }
    }

    return { contents }
  }

  const query = getQuery(event)
  const pageId = event.context.params?.id
  const langId = toInt(query.lang_id)
  const editMode = Boolean(query.edit)
  const [slugKey, slugValue] = decodeURIComponent(
    query.resolve_slug?.toString() || '',
  ).split('=')

  if (!pageId) {
    return []
  }

  const res = await getContent(
    parseInt(pageId),
    langId,
    editMode,
    slugKey,
    slugValue,
  )

  return res
})
