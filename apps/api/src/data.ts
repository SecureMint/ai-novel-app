export const books=[
 {id:'b1',title:'缺德师妹一出手，九州大佬全麻了',author:'月下执灯',tags:['玄幻言情','古代言情','穿越','团宠'],score:9.1},
 {id:'b2',title:'机甲小队，但全员邪修',author:'一梦惊鸿',tags:['科幻末世','机甲','群像'],score:8.9},
 {id:'b3',title:'盗墓：你是个女孩子啊！',author:'四月一日',tags:['悬疑','盗墓','女强'],score:8.7},
 {id:'b4',title:'首席不懂演戏，但她略通一些术法',author:'烤苕皮来喽',tags:['现代言情','娱乐圈','玄学'],score:9},
 {id:'b5',title:'末日灾祸：谁让这群癫子去救世的',author:'长川',tags:['末世','群像','脑洞'],score:9.3}
];
export const chapters=books.flatMap((b,bi)=>Array.from({length:5},(_,i)=>({id:`c${bi+1}-${i+1}`,book_id:b.id,chapter_number:i+1,title:`第 ${i+1} 章 ${i?'新的旅途':'故事开始'}`,content_json:[{p_id:'p1',text:'暮色从远山缓缓落下，故事在这一刻开始。'},{p_id:'p2',text:'所有人都明白，前方的道路不会平坦。'},{p_id:'p3',text:'但他们仍然选择并肩向前。'}],updated_at:new Date().toISOString()})));
