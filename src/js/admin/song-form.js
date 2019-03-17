{
    let view = {
        el: '.page > main',
        init(){
            this.$el = $(this.el)
        },
        template:`
        
        <form class="form">
            <div class="row">
                <label>
                    歌曲名:
                </label>
                <input name="name" type="text" value="__name__">
            </div>
            <div class="row">
                <label>
                    歌手:
                </label>
                <input name="singer" type="text"  value="__singer__">
            </div>
            <div class="row">
                <label>
                    歌曲外链:
                </label>
                <input name="url" type="text"  value="__url__">
            </div>
            <div class="row">
                <label>
                    歌曲封面:
                </label>
                <input name="cover" type="text"  value="__cover__">
            </div>
            <div class="row">
                <textarea name="lyrics" placeholder="歌词上传区域">__lyrics__</textarea>
            </div>
            <div class="row">
                <button type="submit">提交</button>
            </div>
        </form>
        `,
        render(data = {}){
            let placeholders = ['name', 'singer', 'url', 'id', 'cover', 'lyrics']
            let html = this.template
            placeholders.map((string)=>{
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
            if(data.id){
                $(this.el).prepend('<h2>编辑歌曲</h2>')
            }else{
                $(this.el).prepend('<h2>新建歌曲</h2>')
            }
        },
        reset(){
            this.render({})
        }
    }
    let model = {
        data: {
            name:'', singer:'', url:'', id:'', cover:'', lyrics:'' 
        },
        update(data){
            // 第一个参数是 className，第二个参数是 objectId
            var song = AV.Object.createWithoutData('Song', this.data.id);
            // 修改属性
            song.set('name', data.name);
            song.set('singer', data.singer);
            song.set('url', data.url);
            song.set('cover', data.cover);
            song.set('lyrics',data.lyrics);
            // 保存到云端
            console.log(song)
            return song.save().then((response)=>{
                Object.assign(this.data, data)
                return response
            })
        },
        create(data){
        // 声明类型
        var Song = AV.Object.extend('Song');
        // 新建对象
        var song = new Song();
        // 设置名称
        song.set('name',data.name);
        song.set('singer',data.singer);
        song.set('url',data.url);
        song.set('cover', data.cover);
        song.set('lyrics',data.lyrics);
        return song.save().then((newSong)=>{
            let {id, attributes} = newSong
            // this.data.id = id
            // this.data.name = attributes.name
            // this.data.singer = attributes.singer
            // this.data.url = attributes.url
            Object.assign(this.data, {id, ...attributes})
            
        },(error)=>{
            console.error(error);
        });
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.bindEvents()
            this.view.render(this.model.data) 
            
            window.eventHub.on('select', (data)=>{
                this.model.data = data
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', (data)=>{
               if(this.model.data.id){
                   this.model.data = { }
               }else{
                   Object.assign(this.model.data, data)
               }
                this.view.render(this.model.data)
            })
        },
        update(){
            let needs = 'name singer url cover lyrics'.split(' ')
            let data = {}
            needs.map((string)=>{
                data[string]=this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.update(data)
                .then(()=>{
                    
                    window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
                })
        },
        create(){
            let needs = 'name singer url cover lyrics'.split(' ')
            let data = {}
            needs.map((string)=>{
                data[string]=this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.create(data)
                .then(()=>{
                    this.view.reset()
                    //this.model.data === 'ADDR 108'
                    let copy = JSON.stringify(this.model.data)
                    let object = JSON.parse(copy)
                    window.eventHub.emit('create', object)
                })
        },
        bindEvents(){
            this.view.$el.on('submit', 'form', (e)=>{
                e.preventDefault()
                if(this.model.data.id){
                    this.update()
                }else{
                    this.create()
                }
                
                
            })
        }
    }
    controller.init(view, model)
    
}