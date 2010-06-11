package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import arkie.sprockets.*;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Sprite sprite = new CharSprite(this, R.drawable.poke, 4, 3);
		Sprite[][] map = new Sprite[][]{{sprite}, {sprite}};
		SpriteMap main = new SpriteMap(map);
		setContentView(new SpriteView(this, main));
	}
}
