<script lang="ts">
    import { numberWithCommas } from '$lib/common'
    import type { GitRefFields } from '$lib/graphql-operations'
    import { currentDate as now } from '$lib/stores'
    import { getRelativeTime } from '$lib/utils'

    export let ref: GitRefFields

    $: authorName = ref.target.commit?.author.person.displayName ?? ''
    $: authorDate = ref.target.commit ? new Date(ref.target.commit.author.date) : null
    $: behind = ref.target.commit?.behindAhead?.behind
    $: ahead = ref.target.commit?.behindAhead?.ahead

    $: relativeTime = authorDate ? getRelativeTime(authorDate, $now) : ''
</script>

<tr>
    <td>
        <a href={ref.url}><span class="ref px-1 py-0">{ref.displayName}</span></a>
    </td>
    <td colspan={behind || ahead ? 1 : 2}>
        <a href={ref.url}><small>Updated {relativeTime} by {authorName}</small></a>
    </td>
    {#if ahead || behind}
        <td class="diff">
            <a href={ref.url}
                ><small>{numberWithCommas(behind ?? 0)} behind, {numberWithCommas(ahead ?? 0)} ahead</small></a
            >
        </td>
    {/if}
</tr>

<style lang="scss">
    td {
        padding: 0.5rem;
        border-bottom: 1px solid var(--border-color-2);
    }

    tr:last-child td {
        border: none;
    }

    .ref {
        background-color: var(--subtle-bg);
        border-radius: var(--border-radius);
    }

    a {
        display: block;
    }

    small {
        color: var(--text-muted);

        &:hover {
            color: inherit;
        }
    }

    .diff {
        text-align: right;
    }
</style>
