{
    let view = {
        el: '.page > main',
        init(){
            this.$el = $(this.el)
        },
        template:`
        <h2>新建歌曲</h2>
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
                           
                    </label>
                <button type="submit">提交</button>
            </div>
        </form>
        `,
        render(data = {}){
            let placeholders = ['name', 'singer', 'url', 'id']
            let html = this.template
            placeholders.map((string)=>{
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
        },
        reset(){
            this.render({})
        }
    }
    let model = {
        data: {
            name:'', singer:'', url:'', id:'' 
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
            window.eventHub.on('upload', (data)=>{
                this.view.render(data)
            })
            window.eventHub.on('select', (data)=>{
                this.model.data = data
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            this.view.$el.on('submit', 'form', (e)=>{
                e.preventDefault()
                let needs = 'name singer url'.split(' ')
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
            })
        }
    }
    controller.init(view, model)
    
}