import { catchError } from 'rxjs/operators'

import { asError, isErrorLike, type ErrorLike } from '$lib/common'
import { fetchRepoCommits, queryRepositoryComparisonFileDiffs } from '$lib/repo/api/commits'
import { fetchTreeEntries } from '$lib/repo/api/tree'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, parent, url }) => {
    const revisionToCompare = url.searchParams.get('rev')
    // TODO: Improve handling of resolved revision across all routes
    const { resolvedRevision: resolvedRevisionOrError, revision, repoName } = await parent()
    const resolvedRevision = isErrorLike(resolvedRevisionOrError) ? null : resolvedRevisionOrError

    return {
        deferred: {
            treeEntries: resolvedRevision
                ? fetchTreeEntries({
                      repoName,
                      commitID: resolvedRevision.commitID,
                      revision: revision ?? '',
                      filePath: params.path,
                      first: 1000,
                  })
                      .pipe(catchError((error): [ErrorLike] => [asError(error)]))
                      .toPromise()
                      .then(commit => (isErrorLike(commit) ? null : commit.tree))
                : null,
            compare:
                resolvedRevision && revisionToCompare
                    ? {
                          revisionToCompare,
                          diff: fetchRepoCommits({
                              repoID: resolvedRevision.repo.id,
                              revision: revisionToCompare,
                              filePath: params.path,
                              first: 1,
                              pageInfo: { hasNextPage: true, endCursor: '1' },
                          }).then(history =>
                              queryRepositoryComparisonFileDiffs({
                                  repo: resolvedRevision.repo.id,
                                  base: history.nodes[0]?.oid ?? null,
                                  head: revisionToCompare,
                                  paths: [params.path],
                                  first: null,
                                  after: null,
                              }).toPromise()
                          ),
                      }
                    : null,
        },
    }
}
