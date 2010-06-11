package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import arkie.sprockets.*;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Sprite sprite = new CharSprite(this, R.drawable.poke);
		Sprite[][] map = new Sprite[10][10];
		map[5][5] = sprite;
		SpriteMap main = new SpriteMap(map, sprite);
		setContentView(new SpriteView(this, main));
	}
}
