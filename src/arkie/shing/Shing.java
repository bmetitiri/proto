package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import arkie.sprocket.*;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Tileset tile = new Tileset(this, R.drawable.chip);
		tile.setFallback(5,5);
		setContentView(new SprocketView());
	}
}
