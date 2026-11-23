import { useSelect } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";

/**
 * Post author of the edited post, or the current user where there is no
 * post, like in a template of the site editor.
 *
 * @param {boolean} enabled     whether the post author is shown
 * @param {number}  postId      post id from the block context
 * @param {string}  postType    post type from the block context
 * @param {number}  latestCount number of latest posts to load, 0 for none
 *
 * @return {Object|null} user, published post count and latest posts
 */
export function usePostAuthor(enabled, postId, postType, latestCount) {
	return useSelect(
		(select) => {
			if (!enabled) {
				return null;
			}

			const core = select(coreStore);
			const authorId =
				(postId &&
					postType &&
					core.getEditedEntityRecord("postType", postType, postId)?.author) ||
				core.getCurrentUser()?.id;

			if (!authorId) {
				return null;
			}

			const user = core.getEntityRecord("root", "user", authorId, {
				context: "view",
			});

			if (!user) {
				return null;
			}

			const countQuery = {
				author: authorId,
				per_page: 1,
				context: "view",
				_fields: "id",
			};
			//the records call starts the request that fills in the total
			core.getEntityRecords("postType", "post", countQuery);

			//published posts only, like the frontend, without the post being read
			const latest = latestCount
				? core.getEntityRecords("postType", "post", {
						author: authorId,
						per_page: latestCount,
						status: "publish",
						...(postId && { exclude: [postId] }),
						context: "view",
						_fields: "id,title,link,date",
					})
				: null;

			return {
				user,
				count:
					core.getEntityRecordsTotalItems?.("postType", "post", countQuery) ??
					null,
				latest: latest ?? [],
			};
		},
		[enabled, postId, postType, latestCount]
	);
}
