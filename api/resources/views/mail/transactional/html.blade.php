@extends('mail.transactional.layout')

@section('content')
    <p style="margin:0 0 12px">{{ $greeting }}</p>
    @foreach ($paragraphs as $paragraph)
        <p style="margin:0 0 12px">{{ $paragraph }}</p>
    @endforeach

    @if ($reference)
        <p style="margin:16px 0 0"><strong>{{ $reference }}</strong></p>
    @endif
    @if ($dateLabel)
        <p style="margin:0 0 12px">{{ $dateLabel }}{{ $deviceTime ? ' (UTC)' : '' }}</p>
    @endif
    @if ($browser)
        <p style="margin:0 0 6px">{{ __('transactional_mail.device.browser', ['browser' => $browser]) }}</p>
    @endif
    @if ($os)
        <p style="margin:0 0 6px">{{ __('transactional_mail.device.os', ['os' => $os]) }}</p>
    @endif

    @if ($amount !== null)
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px">
            <thead>
                <tr style="background-color:#f4f4f5">
                    <th scope="col" align="left" style="padding:8px">{{ __('transactional_mail.preorder.product') }}</th>
                    <th scope="col" align="right" style="padding:8px">{{ __('transactional_mail.preorder.quantity') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($items as $item)
                    <tr>
                        <td style="padding:8px;border-bottom:1px solid #e4e4e7;overflow-wrap:anywhere">
                            {{ $item['product_name'] }}
                            @if ($item['color_name'] || $item['size'])
                                <br><span style="color:#52525b">{{ implode(' · ', array_filter([$item['color_name'], $item['size']])) }}</span>
                            @endif
                        </td>
                        <td align="right" style="padding:8px;border-bottom:1px solid #e4e4e7">{{ $item['quantity'] }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <th scope="row" align="left" style="padding:8px">{{ __('transactional_mail.preorder.total') }}</th>
                    <td align="right" style="padding:8px;white-space:nowrap"><strong>{{ $amount }}</strong></td>
                </tr>
            </tfoot>
        </table>
    @endif

    @if ($detailsUrl)
        <p style="margin:16px 0 0"><a href="{{ $detailsUrl }}" style="color:#27272a;font-weight:bold">{{ __('transactional_mail.preorder.details') }}</a></p>
    @endif
@endsection
