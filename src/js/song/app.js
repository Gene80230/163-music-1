{   
    let view = {
        el:'#app',
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let {song, status} = data
            this.$el.find('.mask').css('background-image', `url(${song.cover})`)
            this.$el.find('img.cover').attr('src', song.cover)
            if(this.$el.find('audio').attr('src') !== song.url){
                let audio = this.$el.find('audio').attr('src', song.url).get(0)
                audio.onended = ()=>{
                    window.eventHub.emit('songEnd')
                }
                audio.ontimeupdate = ()=>{
                    this.showLyrics(audio.currentTime)
                }
            }
            if(status === 'playing'){
                this.$el.find('.disc-container').addClass('playing')
            }else{
                this.$el.find('.disc-container').removeClass('playing')
            }
            this.$el.find('.song-description>.songName').text(song.name)
            this.$el.find('.song-description>.songSinger').text(song.singer)
            let {lyrics} = song
            let array = lyrics.split('\n').map((string)=>{
                let p = document.createElement('p')
                let regex = /\[([\d:.]+)\](.+)/
                let matches = string.match(regex)
                if(matches){
                    p.textContent = matches[2]
                    let time = matches[1]
                    let parts = time.split(':')
                    let minutes = parts[0]
                    let seconds = parts[1]
                    let newTime = parseInt(minutes, 10) * 60 + parseFloat(seconds, 10)
                    p.setAttribute('data-time', newTime)
                }else{
                    p.textContent = string
                }
                this.$el.find('.lyric>.lines').append(p)
            })
            
        },
        showLyrics(time){
            let allP = this.$el.find('.lyric>.lines>p')
            let p
            for(let i=0;i<allP.length;i++){
                if(i===allP.length-1){
                    p = allP[i]
                    break
                }else{
                    let currentTime = allP.eq(i).attr('data-time')
                    let nextTime = allP.eq(i+1).attr('data-time')
                    if(currentTime <= time && time < nextTime){
                        p = allP[i]
                        break
                    }
                }
            }
            let pHeight = p.getBoundingClientRect().top
            let linesHeight = this.$el.find('.lyric>.lines')[0].getBoundingClientRect().top
            let height = pHeight - linesHeight
            this.$el.find('.lyric>.lines').css({transform: `translateY(${- (height - 25)}px)`})
            $(p).addClass('active').siblings('.active').removeClass('active')
        },
        play(){
            this.$el.find('audio')[0].play()
        },
        pause(){
            this.$el.find('audio')[0].pause()
        }
    }
    let model = {
        data:{
            song:{
                id:'',
                name:'',
                singer:'',
                url:''
            },
            status: 'paused'
        },
        get(id){
            var query = new AV.Query('Song');
            return query.get(id).then((song)=>{
                Object.assign(this.data.song, {id:song.id, ...song.attributes})
                return song
              
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            let id = this.getSongId()
            this.model.get(id).then(()=>{
                
                this.view.render(this.model.data)
            })
            this.bindEvents()
        },
        bindEvents(){
            this.view.$el.on('click', '.icon-play', ()=>{
                this.model.data.status = 'playing'
                this.view.render(this.model.data)
                this.view.play()
            })
            this.view.$el.on('click', '.icon-pause', ()=>{
                this.model.data.status = 'paused'
                this.view.render(this.model.data)
                this.view.pause()
            })
            window.eventHub.on('songEnd',()=>{
                this.model.data.status = 'paused'
                this.view.render(this.model.data)
            })
        },
        getSongId(){
            let search = window.location.search
            if(search.indexOf('?') === 0){
                search = search.substring(1)    
            }
            let array = search.split('&').filter((v=>v))
            let id = ''
            for(let i=0;i<array.length;i++){
                let kv = array[i].split('=')
                let key = kv[0]
                let value  = kv[1]
                if(key === 'id'){
                    id = value
                    break
                }
            }
            return id           
        }
    }
    controller.init(view, model)
}






// If i walk would you run
// 若我自顾走向你，你会逃跑吗
// If i stop would you come
// 若我给你空间，你会慢慢靠近吗
// If i say you're the one
// 若我说你就是独一无二的命中注定
// would you believe me
// 你会相信我么
// If i ask you to stay
// 若我此刻想让你留下来
// would you show me the way
// 你是否会给我一点提示
// Tell me what to say
// so you don't leave me
// 让我知道用怎样的话语才能将你一直留在身边
// The world is catching up to you
// While your running away
// to chase your dream
// 当你背离世界奔波追逐自己的梦想，现实却不断紧迫脚步。
// It's time for us to make a move
// 是时候该有所转变
// cause we are asking one another to change
// 只因我们都期待能走进彼此的心里
// And maybe i'm not ready
// 也许我并没有做好万全的准备
// But i'll try for your love
// 但我会为了你的爱而绝不轻言放弃
// I can hide up above
// 我可以隐藏所有的犹豫和恐惧
// I will try for your love
// 为了你的爱绝不轻言放弃
// We've been hiding enough
// 我们已经躲藏了太久

// If i sing you a song, would you sing along？
// 若我送你一首歌，你是否会和我共鸣
// Or wait till i'm gone, oh how we push and pull
// 或是等到难舍难分时，我们又如何别离
// If i give you my heart ，would you just play the part
// 若我将我的心肺全交于你，你会不会参与我的每一次心跳和呼吸
// Or tell me it's the start of something beautiful
// 或是告诉我一切绝妙与美丽还仅仅是个开始
// Am i catching up to you
// While your running away, to chase your dreams
// 我也不确定我是否该和你一起风雨兼程地追逐你的梦想
// It's time for us to face the truth
// 只知道是时候该面对现实
// cause we are coming to each other to change
// 因为我们要给彼此一个华丽转身
// And maybe i'm not ready
// 或许面对将来的叵测我做的还远远不够
// But i'll try for your love
// 但我会为了对你的爱而努力到精疲力竭
// I can hide up above
// 我可以表现的如钢铁般冰冷无畏
// I will try for your love
// 一切只为了我对你的爱
// We've been hiding enough
// 这份感情已经隐藏了太久
// I will try for your love
// 我会拼尽全力来爱你
// I can hide up above
// 变得无畏
// 2x huh huhhhhhhhhhhhhhhhhh huh huhhh
// If i walk would you run
// 若我不再原地徘徊，你可会无怨追随
// If i stop would you come
// 若我又不再向前，你可会第一时间来到我身边
// If i say you're the one
// 若我说你将是我此生唯一
// would you believe me
// 你可会欣然应允 

