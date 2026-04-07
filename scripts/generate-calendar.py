#!/usr/bin/env python3
"""Genera bluesky-calendar.json amb 10 setmanes de contingut trilingüe."""
import json
from datetime import date
from pathlib import Path

centenary = date(2026, 6, 10)
def dl(d): return (centenary - d).days

curiositats = [
    {"ca": "Gaudí penjava cadenes al revés per trobar la forma perfecta dels arcs. Quan les girava, obtenia la corba catenària — l'estructura més estable possible.\n\nMatemàtiques i gravetat com a eines de disseny.",
     "en": "Gaudí hung chains upside down to find the perfect arch shape. When flipped, they formed catenary curves — the most stable structure possible.\n\nMathematics and gravity as design tools.",
     "ja": "ガウディは鎖を逆さに吊るして完璧なアーチの形を探しました。それを反転させるとカテナリー曲線 — 最も安定した構造が現れます。\n\n数学と重力をデザインツールに。"},
    {"ca": "Set obres de Gaudí són Patrimoni de la Humanitat per la UNESCO. Cap altre arquitecte en té tantes.\n\nCasa Vicens, Parc Güell, Palau Güell, Casa Batlló, Casa Milà, la cripta de la Colònia Güell i la Sagrada Família.",
     "en": "Seven of Gaudí's works are UNESCO World Heritage Sites. No other architect has as many.\n\nCasa Vicens, Park Güell, Palau Güell, Casa Batlló, Casa Milà, the Colònia Güell crypt and the Sagrada Família.",
     "ja": "ガウディの7つの作品がユネスコ世界遺産に登録されています。これほど多い建築家は他にいません。\n\nカサ・ビセンス、グエル公園、グエル邸、カサ・バトリョ、カサ・ミラ、コロニア・グエルの地下聖堂、サグラダ・ファミリア。"},
    {"ca": "El banc serpentí del Parc Güell és probablement el primer moble urbà ergonòmic de la història.\n\nGaudí va fer seure un obrer nu sobre guix fresc perquè el banc s'adaptés al cos humà. 150 metres de trencadís que són còmodes de debò.",
     "en": "The serpentine bench of Park Güell is probably the first ergonomic urban furniture in history.\n\nGaudí had a worker sit naked on fresh plaster so the bench would fit the human body. 150 metres of trencadís that are genuinely comfortable.",
     "ja": "グエル公園の蛇行ベンチは、おそらく歴史上初の人間工学的な都市家具です。\n\nガウディは労働者を裸で生石膏の上に座らせ、人体にフィットするベンチを作りました。150メートルのトレンカディスが本当に快適です。"},
    {"ca": "Gaudí era vegetarià estricte durant els últims anys de la seva vida. Vivia de manera cada cop més austera, fins a instal·lar-se al taller de la Sagrada Família.\n\nQuan va morir, el van confondre amb un indigent.",
     "en": "Gaudí was a strict vegetarian during the last years of his life. He lived ever more austerely, eventually moving into the Sagrada Família workshop.\n\nWhen he died, he was mistaken for a vagrant.",
     "ja": "ガウディは晩年、厳格な菜食主義者でした。ますます質素な生活を送り、最終的にサグラダ・ファミリアの工房に住み込みました。\n\n亡くなった時、浮浪者と間違えられました。"},
    {"ca": "Gaudí feia servir miralls per estudiar com la llum canviava les formes. Per ell, l'arquitectura era l'ordenació de la llum.\n\nA la Sagrada Família, la llum entra per vitralls de colors i transforma l'interior en un bosc iridiscent.",
     "en": "Gaudí used mirrors to study how light changed forms. For him, architecture was the ordering of light.\n\nIn the Sagrada Família, light enters through coloured stained glass and transforms the interior into an iridescent forest.",
     "ja": "ガウディは鏡を使って光がどのように形を変えるかを研究しました。彼にとって建築とは光の秩序化でした。\n\nサグラダ・ファミリアでは、色とりどりのステンドグラスから光が入り、内部を虹色の森に変えます。"},
    {"ca": "El trencadís del Parc Güell utilitza rebutjos de la fàbrica de ceràmica Pujol i Bausis d'Esplugues. Peces defectuoses, trencades, descartades.\n\nGaudí va convertir deixalles industrials en art sublim. Reciclatge artístic un segle abans que fos tendència.",
     "en": "The trencadís of Park Güell uses rejects from the Pujol i Bausis ceramic factory in Esplugues. Defective, broken, discarded pieces.\n\nGaudí turned industrial waste into sublime art. Artistic recycling a century before it became a trend.",
     "ja": "グエル公園のトレンカディスは、エスプルゲスのプジョール・イ・バウシス陶器工場の不良品を使用しています。\n\nガウディは産業廃棄物を崇高な芸術に変えました。それがトレンドになる1世紀前のアーティスティック・リサイクル。"},
    {"ca": "Mai va viatjar fora de Catalunya i el sud de França. Tot i així, la seva obra ha inspirat arquitectes de tot el món.\n\nDeia: «Res no és inventat, perquè la natura ja ho ha escrit tot primer.» No necessitava viatjar: observava.",
     "en": "He never travelled outside Catalonia and the south of France. Yet his work has inspired architects worldwide.\n\nHe said: 'Nothing is invented, because nature has already written everything first.' He didn't need to travel: he observed.",
     "ja": "カタルーニャと南フランス以外に旅行したことはありませんでした。それでも彼の作品は世界中の建築家にインスピレーションを与えています。\n\n旅行は不要でした。彼は観察していたのです。"},
    {"ca": "El drac del Parc Güell originalment escopia aigua com una font. Avui és el símbol més fotografiat de Barcelona.\n\nGaudí el va cobrir de trencadís iridiscent que canvia de color amb la llum del sol.",
     "en": "The dragon of Park Güell originally spouted water like a fountain. Today it is Barcelona's most photographed symbol.\n\nGaudí covered it with iridescent trencadís that changes colour with sunlight.",
     "ja": "グエル公園のドラゴンは元々噴水のように水を吐いていました。今日ではバルセロナで最も写真に撮られるシンボルです。\n\nガウディは虹色のトレンカディスで覆い、太陽の光で色が変わります。"},
    {"ca": "La creu de quatre braços que corona moltes obres de Gaudí simbolitza els quatre punts cardinals.\n\nGaudí no construïa edificis: construïa universos.",
     "en": "The four-armed cross that crowns many of Gaudí's works symbolises the four cardinal points.\n\nGaudí didn't build buildings: he built universes.",
     "ja": "ガウディの多くの作品に冠される四腕の十字架は四方位を象徴しています。\n\nガウディは建物を建てたのではありません。宇宙を建てたのです。"},
    {"ca": "La Sagrada Família s'acabarà aproximadament el 2026 — cent anys després de la mort de Gaudí.\n\nQuatre generacions d'arquitectes han continuat la seva visió. L'obra més llarga de la història moderna arriba al seu final.",
     "en": "The Sagrada Família will be completed around 2026 — a hundred years after Gaudí's death.\n\nFour generations of architects have continued his vision. The longest project in modern history reaches its end.",
     "ja": "サグラダ・ファミリアは2026年頃に完成予定 — ガウディの死から100年後。\n\n4世代の建築家が彼のビジョンを引き継いできました。近代史上最長のプロジェクトが完結を迎えます。"}
]

cites = [
    ("L'originalitat consisteix a tornar a l'origen.",
     "Per a Gaudí, crear no era inventar sinó redescobrir. Cada forma de la natura ja conté la solució perfecta.",
     "For Gaudí, creating wasn't inventing but rediscovering. Every form in nature already contains the perfect solution.",
     "ガウディにとって、創造とは発明ではなく再発見でした。自然のあらゆる形はすでに完璧な解決策を含んでいます。"),
    ("La línia recta és la línia dels homes. La corba és la línia de Déu.",
     "Observeu la natura: no hi ha angles rectes. Les branques es corben, les ones ondulant, els ossos es retorcen. Gaudí va construir com la natura construeix.",
     "Observe nature: there are no right angles. Branches curve, waves undulate, bones twist. Gaudí built the way nature builds.",
     "自然を観察してください。直角は存在しません。枝は曲がり、波はうねり、骨はねじれます。ガウディは自然が建てるように建てました。"),
    ("Per fer les coses bé cal: primer, l'amor; segon, la tècnica.",
     "Gaudí posava la passió per davant del saber fer. Sense amor pel que fas, la tècnica és buida.",
     "Gaudí put passion before skill. Without love for what you do, technique is empty.",
     "ガウディは情熱を技術の上に置きました。やっていることへの愛がなければ、技術は空虚です。"),
    ("El color en els objectes és la vida.",
     "La Casa Batlló és la prova: la façana canvia de color amb la llum del dia. El trencadís iridiscent s'il·lumina a l'alba i es torna profund al capvespre.",
     "Casa Batlló is the proof: the façade changes colour with daylight. The iridescent trencadís glows at dawn and deepens at dusk.",
     "カサ・バトリョがその証拠です。ファサードは日光とともに色を変えます。虹色のトレンカディスは夜明けに輝き、夕暮れには深みを増します。"),
    ("Res no és art si no prové de la natura.",
     "Les columnes de la SF imiten arbres. La façana de la Casa Batlló evoca el mar. Les xemeneies del Palau Güell semblen bolets. Gaudí no copiava la natura: l'entenia.",
     "The columns of the SF mimic trees. Casa Batlló's façade evokes the sea. Palau Güell's chimneys resemble mushrooms. Gaudí didn't copy nature: he understood it.",
     "SFの柱は木を、カサ・バトリョのファサードは海を、グエル邸の煙突はキノコを模しています。ガウディは自然をコピーせず、理解しました。"),
    ("L'arbre prop del meu taller: aquest és el meu mestre.",
     "Gaudí estudiava els arbres amb ulls d'enginyer. Les columnes de la Sagrada Família són arbres de pedra — la seva lliçó final.",
     "Gaudí studied trees with an engineer's eyes. The Sagrada Família columns are stone trees — his final lesson.",
     "ガウディはエンジニアの目で木を研究しました。サグラダ・ファミリアの柱は石の木 — 彼の最後の教訓です。"),
    ("La creació continua incessantment a través dels mitjans de l'home.",
     "Gaudí creia que l'artista és un instrument de la creació. No inventem: continuem l'obra de la natura.",
     "Gaudí believed the artist is an instrument of creation. We don't invent: we continue nature's work.",
     "ガウディは芸術家は創造の道具だと信じていました。私たちは発明しません。自然の仕事を続けるのです。"),
    ("La bellesa és el resplendor de la veritat.",
     "Per a Gaudí, allò que és estructuralment perfecte és automàticament bell. No decorava per amagar: revelava.",
     "For Gaudí, what is structurally perfect is automatically beautiful. He didn't decorate to conceal: he revealed.",
     "ガウディにとって、構造的に完璧なものは自動的に美しいのです。彼は隠すために装飾したのではなく、明らかにしました。"),
    ("Tot surt del gran llibre de la natura.",
     "Gaudí deia que la natura és el gran llibre, sempre obert. Avui ho diem biomímesi. Ell ho feia un segle abans que existís la paraula.",
     "Gaudí said nature is the great book, always open. Today we call it biomimicry. He was doing it a century before the word existed.",
     "ガウディは自然は常に開かれた偉大な書物だと言いました。今日それをバイオミミクリーと呼びます。彼はその言葉が存在する1世紀前に実践していました。"),
    ("Soc català i parlaré en català.",
     "1924. Un policia exigeix a Gaudí, de 72 anys, que parli en castellà. Gaudí es nega. L'arresten.\n\nAquesta app està feta en català. És el que hauria volgut el mestre.",
     "1924. A policeman demands 72-year-old Gaudí speak Spanish. Gaudí refuses. He is arrested.\n\nThis app is made in Catalan. It's what the master would have wanted.",
     "1924年。警察官が72歳のガウディにスペイン語で話すよう要求。ガウディは拒否。逮捕される。\n\nこのアプリはカタルーニャ語で作られています。それが巨匠の望んだことです。"),
]

educatius = [
    {"ca": "Què és el trencadís?\n\nEl trencadís és una tècnica decorativa que utilitza fragments irregulars de ceràmica, vidre o altres materials per crear mosaics.\n\nEl nom ve del verb català «trencar» — l'art de trencar per crear. Gaudí no el va inventar, però el va portar a un nivell que ningú ha superat.",
     "en": "What is trencadís?\n\nTrencadís is a decorative technique using irregular fragments of ceramic, glass or other materials to create mosaics.\n\nThe name comes from the Catalan verb 'trencar' (to break) — the art of breaking to create. Gaudí didn't invent it, but took it to a level no one has surpassed.",
     "ja": "トレンカディスとは？\n\n陶器、ガラスなどの不規則な破片を使ってモザイクを作る装飾技法です。\n\n名前はカタルーニャ語の「trencar」（割る）に由来 — 割ることで創造する芸術。ガウディはこれを誰も超えられないレベルに引き上げました。"},
    {"ca": "Les columnes de la Sagrada Família es ramifiquen cap al sostre com troncs d'arbre, distribuint el pes com un bosc de pedra.\n\nGaudí va ser el primer arquitecte biomimètic — estudiava la natura amb ulls d'enginyer.",
     "en": "The columns of the Sagrada Família branch towards the ceiling like tree trunks, distributing weight like a forest of stone.\n\nGaudí was the first biomimetic architect — he studied nature with an engineer's eyes.",
     "ja": "サグラダ・ファミリアの柱は木の幹のように天井に向かって枝分かれし、石の森のように重量を分配しています。\n\nガウディは最初のバイオミメティック建築家でした。"},
    {"ca": "Per a Gaudí, el trencadís era una metàfora: de la destrucció neix la creació.\n\nCada fragment trencat troba el seu lloc en un tot harmònic. No hi ha errors, només possibilitats.\n\nCom la vida mateixa.",
     "en": "For Gaudí, trencadís was a metaphor: from destruction, creation is born.\n\nEvery broken fragment finds its place in a harmonious whole. There are no mistakes, only possibilities.\n\nLike life itself.",
     "ja": "ガウディにとってトレンカディスは比喩でした。破壊から創造が生まれる。\n\n壊れた破片は調和の中にその場所を見つけます。間違いはなく、可能性だけ。\n\n人生そのもののように。"},
    {"ca": "La façana de la Casa Batlló evoca ossos, esquelets i formes marines. La teulada imita l'esquena d'un drac.\n\nEl trencadís iridiscent canvia de color amb la llum: blau intens al matí, verds i violetes al capvespre.",
     "en": "Casa Batlló's façade evokes bones, skeletons and marine forms. The roof mimics the back of a dragon.\n\nThe iridescent trencadís changes colour with the light: deep blue in the morning, greens and violets at dusk.",
     "ja": "カサ・バトリョのファサードは骨、骸骨、海の形を想起させます。屋根はドラゴンの背中を模しています。\n\n虹色のトレンカディスは光とともに色を変えます。朝は深い青、夕方には緑と紫に。"},
    {"ca": "El Parc Güell n'és l'exemple més famós, però el trencadís apareix arreu de l'obra de Gaudí:\n\n🏛 Terrats del Palau Güell\n🐚 Façana de la Casa Batlló\n⛪ Pinacles de la Sagrada Família\n🏗 Cripta de la Colònia Güell\n🏠 Casa Vicens (la primera!)\n\nBarcelona és un museu de trencadís a cel obert.",
     "en": "Park Güell is the most famous example, but trencadís appears throughout Gaudí's work:\n\n🏛 Palau Güell rooftops\n🐚 Casa Batlló façade\n⛪ Sagrada Família pinnacles\n🏗 Colònia Güell crypt\n🏠 Casa Vicens (the first!)\n\nBarcelona is an open-air trencadís museum.",
     "ja": "グエル公園が最も有名ですが、トレンカディスはガウディの作品のあらゆる所に：\n\n🏛 グエル邸の屋上\n🐚 カサ・バトリョのファサード\n⛪ サグラダ・ファミリアの尖塔\n🏗 コロニア・グエルの地下聖堂\n🏠 カサ・ビセンス（最初！）\n\nバルセロナは野外トレンカディス美術館。"},
    {"ca": "Les xemeneies del Palau Güell són bolets gegants coberts de trencadís. Cada una és diferent.\n\nGaudí va transformar elements funcionals en escultures. Per a ell, tot podia ser art — fins i tot una xemeneia.",
     "en": "Palau Güell's chimneys are giant mushrooms covered in trencadís. Each one is different.\n\nGaudí transformed functional elements into sculptures. For him, everything could be art — even a chimney.",
     "ja": "グエル邸の煙突はトレンカディスで覆われた巨大なキノコです。それぞれが異なります。\n\nガウディは機能的な要素を彫刻に変えました。煙突でさえも芸術に。"},
    {"ca": "L'arc catenari és la forma que adopta una cadena penjant per la gravetat. Invertida, és l'arc més estable possible.\n\nGaudí la va fer servir arreu. No necessitava ordinadors. Tenia la gravetat.",
     "en": "The catenary arch is the shape a chain adopts hanging under gravity. Inverted, it's the most stable arch possible.\n\nGaudí used it everywhere. He didn't need computers. He had gravity.",
     "ja": "カテナリーアーチとは重力で吊り下げた鎖が描く形。反転させると最も安定したアーチに。\n\nガウディはどこでもこれを使いました。コンピューターは不要。重力があったのです。"},
]

cal = []

def make_thread(id_, d, type_, ci_or_qi_or_ei, source, link=None):
    n = dl(d)
    posts = []
    if source == "curiositat":
        c = curiositats[ci_or_qi_or_ei]
        posts = [
            {"lang":"ca","text":f"Falten {n} dies per al centenari de Gaudí.\n\n{c['ca']}\n\n#Gaudí #Centenari2026 #Barcelona"},
            {"lang":"en","text":f"🇬🇧 {n} days until the Gaudí centenary.\n\n{c['en']}\n\n#Gaudí #Centenary2026 #Barcelona"},
            {"lang":"ja","text":f"🇯🇵 ガウディ没後100周年まであと{n}日。\n\n{c['ja']}\n\n#ガウディ #バルセロナ #建築"}
        ]
    elif source == "cita":
        q = cites[ci_or_qi_or_ei]
        posts = [
            {"lang":"ca","text":f"«{q[0]}»\n\n{q[1]}\n\nFalten {n} dies.\n\n#Gaudí #Centenari2026"},
            {"lang":"en","text":f"🇬🇧 '{q[0]}'\n\n{q[2]}\n\n{n} days to go.\n\n#Gaudí #Centenary2026"},
            {"lang":"ja","text":f"🇯🇵 「{q[0]}」\n\n{q[3]}\n\nあと{n}日。\n\n#ガウディ #建築"}
        ]
    elif source == "educatiu":
        e = educatius[ci_or_qi_or_ei]
        posts = [
            {"lang":"ca","text":f"{e['ca']}\n\nFalten {n} dies.\n\n#Gaudí #Trencadís #Centenari2026"},
            {"lang":"en","text":f"🇬🇧 {e['en']}\n\n{n} days to go.\n\n#Gaudí #Trencadís #Centenary2026"},
            {"lang":"ja","text":f"🇯🇵 {e['ja']}\n\nあと{n}日。\n\n#ガウディ #トレンカディス"}
        ]
    entry = {"id":id_,"date":d.isoformat(),"type":type_,"published":False,"posts":posts}
    if link: entry["link"] = link
    return entry

# Week 1: only Friday (launch was Thu)
cal.append(make_thread("w1-fri-edu", date(2026,4,4), "educational", 0, "educatiu"))

# Weeks 2-10
schedule = [
    # (week, mon, cur_i, wed, cit_i, fri, edu_i)
    (2, date(2026,4,7),0,  date(2026,4,9),0,   date(2026,4,11),1),
    (3, date(2026,4,14),1, date(2026,4,16),1,   date(2026,4,18),2),
    (4, date(2026,4,21),2, None,None,            date(2026,4,25),3),  # Sant Jordi Wed
    (5, date(2026,4,28),3, date(2026,4,30),3,   None,None),          # May 1 special
    (6, date(2026,5,4),4,  date(2026,5,6),4,    date(2026,5,8),4),
    (7, date(2026,5,11),5, date(2026,5,13),5,   date(2026,5,15),5),
    (8, date(2026,5,18),6, date(2026,5,20),6,   date(2026,5,22),6),
    (9, date(2026,5,25),7, date(2026,5,27),7,   date(2026,5,29),None),
    (10,date(2026,6,1),8,  None,None,            date(2026,6,5),None),
]

for w, mon, ci, wed, qi, fri, ei in schedule:
    cal.append(make_thread(f"w{w}-mon", mon, "countdown", ci, "curiositat"))
    if wed and qi is not None:
        cal.append(make_thread(f"w{w}-wed", wed, "quote", qi, "cita"))
    if fri and ei is not None:
        cal.append(make_thread(f"w{w}-fri", fri, "educational", ei, "educatiu"))

# ---- ESPECIALS ----
# Sant Jordi
sj = date(2026,4,23); n=dl(sj)
cal.append({"id":"special-sant-jordi","date":sj.isoformat(),"type":"special","published":False,"posts":[
    {"lang":"ca","text":f"Bona diada de Sant Jordi! 🌹📖\n\nGaudí va ser arrestat l'11 de setembre de 1924 per parlar en català. Va declarar: «Soc català i parlaré en català.»\n\nAvui, dia del llibre i la rosa, recordem que la llengua és tan important com l'arquitectura.\n\nFalten {n} dies per al centenari.\n\n#SantJordi #Gaudí #Català"},
    {"lang":"en","text":f"🇬🇧 Happy Sant Jordi! 🌹📖\n\nGaudí was arrested in 1924 for speaking Catalan. He declared: 'I am Catalan and I will speak Catalan.'\n\nToday, Catalonia's day of books and roses, let us remember that language is as important as architecture.\n\n{n} days to the centenary.\n\n#SantJordi #Gaudí #Catalan"},
    {"lang":"ja","text":f"🇯🇵 サン・ジョルディの日おめでとう！🌹📖\n\nガウディは1924年にカタルーニャ語を話したことで逮捕されました。「私はカタルーニャ人であり、カタルーニャ語で話す」と宣言。\n\n言語は建築と同じくらい重要です。\n\n100周年まであと{n}日。\n\n#サンジョルディ #ガウディ"}
]})

# Dia del Treball
dt = date(2026,5,1); n=dl(dt)
cal.append({"id":"special-dia-treball","date":dt.isoformat(),"type":"special","published":False,"posts":[
    {"lang":"ca","text":f"El trencadís és l'art de l'artesà.\n\nGaudí treballava amb paletes, ceramistes, ferrers, vidriers. Cada fragment del Parc Güell va ser col·locat a mà.\n\nEn el Dia del Treball, recordem que rere cada obra mestra hi ha milers de mans.\n\nFalten {n} dies.\n\n#DiadelTreball #Gaudí #Artesania"},
    {"lang":"en","text":f"🇬🇧 Trencadís is the art of the artisan.\n\nGaudí worked with bricklayers, ceramicists, blacksmiths, glaziers. Every fragment in Park Güell was placed by hand.\n\nOn Labour Day, remember: behind every masterpiece, thousands of hands.\n\n{n} days to go.\n\n#LabourDay #Gaudí #Craftsmanship"},
    {"lang":"ja","text":f"🇯🇵 トレンカディスは職人の芸術。\n\nガウディは左官、陶芸家、鍛冶屋と共に働きました。グエル公園のすべての破片は手作業で置かれました。\n\nメーデーに — すべての傑作の裏に何千もの手があることを。\n\nあと{n}日。\n\n#メーデー #ガウディ"}
]})

# 1 setmana
cal.append({"id":"special-1week","date":"2026-06-03","type":"countdown","published":False,"posts":[
    {"lang":"ca","text":"Una setmana.\n\nFalten 7 dies per al centenari de la mort d'Antoni Gaudí.\n\n10 de juny de 1926 — 10 de juny de 2026.\n\nCent anys d'una obra que segueix creixent, inspirant, meravellant.\n\n#Gaudí #Centenari2026 #Barcelona"},
    {"lang":"en","text":"🇬🇧 One week.\n\n7 days until the centenary of Antoni Gaudí's death.\n\n10 June 1926 — 10 June 2026.\n\nA hundred years of a body of work that keeps growing, inspiring, astonishing.\n\n#Gaudí #Centenary2026 #Barcelona"},
    {"lang":"ja","text":"🇯🇵 あと1週間。\n\nアントニ・ガウディの没後100周年まであと7日。\n\n1926年6月10日 — 2026年6月10日。\n\n成長し続ける作品群の100年。\n\n#ガウディ #没後100周年 #バルセロナ"}
]})

# Atropellament
cal.append({"id":"special-atropellament","date":"2026-06-07","type":"special","published":False,"posts":[
    {"lang":"ca","text":"Avui fa 100 anys.\n\nEl 7 de juny de 1926, Antoni Gaudí va ser atropellat per un tramvia. Ningú el va reconèixer pel seu aspecte humil. Va morir tres dies després.\n\nBarcelona sencera el va plorar.\n\n#Gaudí #Centenari2026"},
    {"lang":"en","text":"🇬🇧 Today, 100 years ago.\n\nOn 7 June 1926, Antoni Gaudí was struck by a tram. Nobody recognised him due to his humble appearance. He died three days later.\n\nAll of Barcelona mourned him.\n\n#Gaudí #Centenary2026"},
    {"lang":"ja","text":"🇯🇵 今日から100年前。\n\n1926年6月7日、ガウディは路面電車にはねられました。質素な身なりのため誰も気づかず。3日後に亡くなりました。\n\nバルセロナ全体が彼を悼みました。\n\n#ガウディ #没後100周年"}
]})

# CENTENARI
cal.append({"id":"special-centenari","date":"2026-06-10","type":"centenary","published":False,"link":"https://gaudimosaic.art","posts":[
    {"lang":"ca","text":"10 de juny de 2026.\n\nFa cent anys que va morir Antoni Gaudí.\n\nL'home que va transformar Barcelona en un museu a cel obert. Que va convertir deixalles de ceràmica en art sublim. Que va construir com la natura construeix.\n\nLa seva obra no ha envellit ni un sol dia.\n\n«L'originalitat consisteix a tornar a l'origen.»\n\nGràcies, mestre.\n\n🔗 gaudimosaic.art\n\n#Gaudí #Centenari2026 #Barcelona #Trencadís #Catalunya"},
    {"lang":"en","text":"🇬🇧 10 June 2026.\n\nOne hundred years since Antoni Gaudí died.\n\nThe man who transformed Barcelona into an open-air museum. Who turned ceramic waste into sublime art. Who built the way nature builds.\n\nHis work hasn't aged a single day.\n\n'Originality consists in returning to the origin.'\n\nThank you, master.\n\n🔗 gaudimosaic.art\n\n#Gaudí #Centenary2026 #Barcelona #Trencadís"},
    {"lang":"ja","text":"🇯🇵 2026年6月10日。\n\nアントニ・ガウディが亡くなって100年。\n\nバルセロナを野外美術館に変えた人。陶器の廃棄物を崇高な芸術に変えた人。自然が建てるように建てた人。\n\n彼の作品は一日たりとも古びていません。\n\nありがとう、巨匠。\n\n🔗 gaudimosaic.art\n\n#ガウディ #没後100周年 #バルセロナ #トレンカディス"}
]})

cal.sort(key=lambda x: x["date"])
Path(__file__).parent.joinpath("bluesky-calendar.json").write_text(json.dumps(cal, ensure_ascii=False, indent=2))
print(f"Generat: {len(cal)} entrades")
for e in cal:
    print(f"  {e['date']} [{e['type']:12s}] {e['id']}")
