package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import arkie.sprockets.*;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		ChipSprite c = new ChipSprite(this, R.drawable.chip, 16, 16);
		c.setDefault(5,5);
		Player p = new Player(this, R.drawable.poke);
		Sprite[][] map = new Sprite[][]{
			{c,c,c},
			{c,c,c},
			{c,c,c},
		};
		SpriteMap main = new SpriteMap(map, c);
		setContentView(new SpriteView(this, main));
	}
}
