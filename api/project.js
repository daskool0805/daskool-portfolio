import {sanityQuery, send} from "./_sanity.js";

const fields = `{_id,title,"slug":slug.current,year,category,client,shortDescription,fullDescription,featured,status,projectOrder,legacyEyebrow,
 "thumbnail":thumbnail.asset->{url,metadata{dimensions,lqip}},"coverImage":coverImage.asset->{url,metadata{dimensions,lqip}},
 content[]{...,"image":image{alt,caption,...asset->{url,metadata{dimensions,lqip}}},images[]{...,"asset":asset->{url,metadata{dimensions,lqip}}},"poster":poster.asset->{url,metadata{dimensions,lqip}},file{asset->{url,mimeType}}}}`;

export default async function handler(req, res) {
  const slug = String(req.query.slug || "");
  if (!slug) return send(res, 400, {error:"Missing slug"});
  const preview = req.query.preview === "1";
  if (preview && (!process.env.SANITY_PREVIEW_SECRET || !process.env.SANITY_API_READ_TOKEN || req.headers.authorization !== `Bearer ${process.env.SANITY_PREVIEW_SECRET}`)) return send(res, 401, {error:"Unauthorized"}, true);
  const query = preview
    ? `*[_type == "project" && slug.current == $slug] | order(_updatedAt desc)[0]${fields}`
    : `*[_type == "project" && slug.current == $slug && status == "published"][0]${fields}`;
  try {
    const project = await sanityQuery(query, {slug}, preview ? process.env.SANITY_API_READ_TOKEN : "", preview ? "drafts" : "published");
    send(res, project ? 200 : 404, project || {error:"Project not found"}, preview);
  } catch (error) { send(res, 503, {error:error.message}); }
}
