<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * "delivered" duplicated "sent", so the order lifecycle now reads processing,
     * sent, being_delivered, reported, cancelled. Existing "delivered" rows become
     * "being_delivered" and the PostgreSQL CHECK constraints follow the new set.
     */
    public function up(): void
    {
        $this->swap('delivered', 'being_delivered', ['processing', 'sent', 'being_delivered', 'reported', 'cancelled']);
    }

    public function down(): void
    {
        $this->swap('being_delivered', 'delivered', ['processing', 'sent', 'delivered', 'reported', 'cancelled']);
    }

    /**
     * @param  list<string>  $allowed
     */
    private function swap(string $from, string $to, array $allowed): void
    {
        $pgsql = DB::getDriverName() === 'pgsql';

        if ($pgsql) {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_status_check');
        }

        DB::table('orders')->where('status', $from)->update(['status' => $to]);
        DB::table('order_items')->where('status', $from)->update(['status' => $to]);

        if ($pgsql) {
            $list = "'".implode("', '", $allowed)."'";
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ({$list}))");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_status_check CHECK (status IN ({$list}))");
        }
    }
};
