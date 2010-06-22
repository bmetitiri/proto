package arkie.sprockets;

/*	{0,0,0,1,0}, // X Y 1+>
	{1,0,0,0,1}, // 1 \ Upper-left corner
	{1,0,0,0,1}, // +   This pattern makes a J
	{1,1,1,1,0}, // v
	{1,0,0,0,0}, */
public class SpriteMap {
	Sprite[][] map;
	int height, width, spriteHeight, spriteWidth;
	public SpriteMap(Sprite[][] map){
		this.setMap(map);
		if (this.map.length>0 && this.map[0].length>0 &&
				this.map[0][0] != null)
			this.setSprite(map[0][0]);
	}
	public SpriteMap(Sprite[][] map, Sprite sprite){
		this.setMap(map);
		this.setSprite(sprite);
	}
	public void setMap(Sprite[][] map){
		this.map = map;
		this.height = map[0].length;
		this.width = map.length;
	}
	public void setSprite(Sprite sprite){
		this.spriteHeight = sprite.getHeight();
		this.spriteWidth = sprite.getWidth();
	}
	public Sprite[][] getMap(){return this.map;}
	public int getHeight(){return this.height;}
	public int getWidth(){return this.width;}
	public int getSpriteHeight(){return this.spriteHeight;}
	public int getSpriteWidth(){return this.spriteWidth;}
}
