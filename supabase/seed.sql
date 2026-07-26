WITH seed(title,author,status,score,tags) AS (VALUES
 ('缺德师妹一出手，九州大佬全麻了','月下执灯','连载中',9.1,ARRAY['玄幻言情','古代言情','穿越','团宠']),
 ('机甲小队，但全员邪修','一梦惊鸿','连载中',8.9,ARRAY['科幻末世','机甲','群像']),
 ('盗墓：你是个女孩子啊！','四月一日','连载中',8.7,ARRAY['悬疑','盗墓','女强']),
 ('首席不懂演戏，但她略通一些术法','烤苕皮来喽','已完结',9.0,ARRAY['现代言情','娱乐圈','玄学']),
 ('末日灾祸：谁让这群癫子去救世的','长川','已完结',9.3,ARRAY['末世','群像','脑洞'])
) INSERT INTO books(title,author,status,score,tags) SELECT * FROM seed WHERE NOT EXISTS(SELECT 1 FROM books b WHERE b.title=seed.title);
INSERT INTO chapters(book_id,chapter_number,title,content_json)
SELECT b.id,n,'第 '||n||' 章',jsonb_build_array(jsonb_build_object('p_id','p1','text','暮色从远山缓缓落下，故事在这一刻开始。'),jsonb_build_object('p_id','p2','text','所有人都明白，前方的道路不会平坦。'),jsonb_build_object('p_id','p3','text','但他们仍然选择并肩向前。')) FROM books b CROSS JOIN generate_series(1,5) n ON CONFLICT(book_id,chapter_number) DO NOTHING;
